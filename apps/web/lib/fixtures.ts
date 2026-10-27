import type {
  Course,
  Enrollment,
  Module,
  Quiz,
  StudentProgress,
} from "./models";

const instructors = {
  maya: {
    name: "Maya Chen",
    title: "Software engineer & educator",
    initials: "MC",
  },
  daniel: {
    name: "Daniel Nguyen",
    title: "Senior software engineer",
    initials: "DN",
  },
  amara: {
    name: "Amara Okafor",
    title: "Cloud solutions architect",
    initials: "AO",
  },
  linh: {
    name: "Linh Tran",
    title: "AI engineer & researcher",
    initials: "LT",
  },
  alex: {
    name: "Alex Rivera",
    title: "Machine learning engineer",
    initials: "AR",
  },
};

function curriculum(
  id: string,
  topic: string,
  units: [string, string],
): Module[] {
  const descriptions = [
    `Start with the essential ideas behind ${topic}. Think of a small practical problem you would like to solve, and connect each new concept to that goal.`,
    `A strong foundation makes experimentation easier. Review the example, identify the inputs and outputs, and explain each step in your own words before changing it.`,
    `Apply what you have learned in a focused exercise. Break the task into smaller steps, check one assumption at a time, and compare your result with the expected behavior.`,
    `Check your understanding of ${topic}. Read each question carefully, choose the best answer, and use the feedback to revisit any concepts that need more practice.`,
  ];
  return units.map((title, moduleIndex) => ({
    id: `${id}-module-${moduleIndex + 1}`,
    title,
    lessons: [
      {
        id: `${id}-${moduleIndex * 4 + 1}`,
        title: moduleIndex
          ? `Putting ${topic} into practice`
          : `Welcome to ${topic}`,
        type: "video",
        duration: "8 min",
        content: descriptions[0],
      },
      {
        id: `${id}-${moduleIndex * 4 + 2}`,
        title: moduleIndex
          ? "Patterns, tradeoffs, and useful habits"
          : "The foundations: a practical guide",
        type: "reading",
        duration: "12 min",
        content: descriptions[1],
      },
      {
        id: `${id}-${moduleIndex * 4 + 3}`,
        title: moduleIndex
          ? "Build your first complete project"
          : "Your first hands-on exercise",
        type: "video",
        duration: "18 min",
        content: descriptions[2],
      },
      {
        id: `${id}-${moduleIndex * 4 + 4}`,
        title: moduleIndex
          ? "Final knowledge check"
          : "Check your understanding",
        type: "quiz",
        duration: "5 min",
        content: descriptions[3],
      },
    ],
  }));
}

export const courses: Course[] = [
  {
    id: "python",
    slug: "python-for-everyone",
    title: "Python for Everyone",
    subtitle: "Your first step into a world of possibilities.",
    description:
      "Learn to think like a programmer and turn everyday problems into elegant Python solutions. Build confidence with practical exercises, clear explanations, and a small project you can make your own.",
    subject: "Development",
    level: "Beginner",
    language: "en",
    instructor: instructors.maya,
    rating: 4.9,
    learners: 12480,
    duration: "6 weeks",
    skills: ["Python", "Problem solving", "Data structures", "Automation"],
    outcomes: [
      "Write clear Python programs using variables, loops, and functions",
      "Work with lists, dictionaries, and everyday data",
      "Debug problems with a practical, repeatable process",
      "Build a useful automation project from start to finish",
    ],
    modules: curriculum("python", "Python", [
      "Getting started with Python",
      "From ideas to useful programs",
    ]),
    status: "published",
    color: "#E9F1FF",
    art: "python",
    featured: true,
  },
  {
    id: "java",
    slug: "spring-boot-backend-development",
    title: "Build Better Backends with Spring Boot",
    subtitle: "Create reliable APIs with modern Java.",
    description:
      "Take a thoughtful approach to backend engineering with Java and Spring Boot. Design clear APIs, structure your application, and learn how validation and tests make software easier to change.",
    subject: "Development",
    level: "Intermediate",
    language: "en",
    instructor: instructors.daniel,
    rating: 4.8,
    learners: 8640,
    duration: "8 weeks",
    skills: ["Java", "Spring Boot", "REST APIs", "Testing"],
    outcomes: [
      "Design REST resources with clear contracts",
      "Organize a maintainable Spring Boot application",
      "Validate inputs and handle errors consistently",
      "Test behavior with focused unit and integration tests",
    ],
    modules: curriculum("java", "Spring Boot", [
      "Your first Spring Boot API",
      "Building reliable services",
    ]),
    status: "published",
    color: "#F8EDE5",
    art: "java",
    featured: true,
  },
  {
    id: "cloud",
    slug: "aws-cloud-foundations",
    title: "AWS Cloud Foundations",
    subtitle: "Understand the cloud. Build with confidence.",
    description:
      "Explore cloud architecture through approachable examples. Learn the roles of compute, storage, networking, and identity, and practice making sensible tradeoffs before a real cloud deployment.",
    subject: "Cloud",
    level: "Beginner",
    language: "en",
    instructor: instructors.amara,
    rating: 4.9,
    learners: 10230,
    duration: "5 weeks",
    skills: ["AWS", "Cloud architecture", "Networking", "Security"],
    outcomes: [
      "Explain common AWS building blocks",
      "Compare compute and storage options",
      "Reason about network and identity boundaries",
      "Sketch a resilient cloud architecture and its tradeoffs",
    ],
    modules: curriculum("cloud", "cloud architecture", [
      "The building blocks of the cloud",
      "Architecture in the real world",
    ]),
    status: "published",
    color: "#E8F4EF",
    art: "cloud",
    featured: true,
  },
  {
    id: "rag",
    slug: "practical-rag-applications",
    title: "Build AI Apps with RAG",
    subtitle: "Give language models the context they need.",
    description:
      "Move from a language model demo to a grounded application. Explore retrieval, embeddings, source quality, and evaluation through practical examples with explicit attention to access boundaries.",
    subject: "AI",
    level: "Intermediate",
    language: "en",
    instructor: instructors.linh,
    rating: 4.9,
    learners: 6720,
    duration: "6 weeks",
    skills: ["RAG", "Embeddings", "LLMs", "Evaluation"],
    outcomes: [
      "Describe a retrieval-augmented generation pipeline",
      "Compare chunking and retrieval strategies",
      "Connect answers to authorized source evidence",
      "Evaluate grounded answers and recognize uncertainty",
    ],
    modules: curriculum("rag", "RAG", [
      "Grounding language model applications",
      "Retrieval, evidence, and evaluation",
    ]),
    status: "published",
    color: "#F0ECFA",
    art: "rag",
    featured: true,
  },
  {
    id: "ml",
    slug: "machine-learning-foundations",
    title: "Machine Learning Foundations",
    subtitle: "Find patterns. Ask better questions.",
    description:
      "Build an intuitive understanding of how machines learn from data. Explore useful models, careful evaluation, and the decisions that turn a promising experiment into a reliable result.",
    subject: "Data",
    level: "Beginner",
    language: "en",
    instructor: instructors.alex,
    rating: 4.7,
    learners: 9130,
    duration: "7 weeks",
    skills: ["Machine learning", "Python", "Data analysis", "Statistics"],
    outcomes: [
      "Frame a practical machine learning problem",
      "Prepare a dataset and choose a simple baseline",
      "Interpret common evaluation metrics",
      "Recognize overfitting, leakage, and misleading results",
    ],
    modules: curriculum("ml", "machine learning", [
      "Learning from data",
      "Models and meaningful evaluation",
    ]),
    status: "published",
    color: "#FFF2DF",
    art: "ml",
    featured: false,
  },
  {
    id: "llm",
    slug: "ung-dung-llm-thuc-te",
    title: "Ứng dụng LLM trong thực tế",
    subtitle: "Từ ý tưởng đến sản phẩm AI có trách nhiệm.",
    description:
      "Khám phá cách xây dựng ứng dụng với mô hình ngôn ngữ lớn. Tìm hiểu thiết kế lời nhắc, đánh giá kết quả và giới hạn của AI qua các ví dụ dễ tiếp cận.",
    subject: "AI",
    level: "Advanced",
    language: "vi",
    instructor: instructors.linh,
    rating: 4.8,
    learners: 4280,
    duration: "4 weeks",
    skills: ["LLMs", "Prompt design", "AI safety", "Evaluation"],
    outcomes: [
      "Hiểu vai trò và giới hạn của mô hình ngôn ngữ lớn",
      "Thiết kế lời nhắc rõ ràng và có cấu trúc",
      "Đánh giá chất lượng câu trả lời bằng tiêu chí cụ thể",
      "Xác định rủi ro trước khi triển khai ứng dụng AI",
    ],
    modules: curriculum("llm", "language model applications", [
      "Hiểu về mô hình ngôn ngữ",
      "Thiết kế ứng dụng AI có trách nhiệm",
    ]),
    status: "published",
    color: "#E6F4F8",
    art: "llm",
    featured: false,
  },
  {
    id: "draft-cloud",
    slug: "cloud-design-patterns",
    title: "Cloud Design Patterns",
    subtitle: "A practical guide to resilient systems.",
    description:
      "A draft course exploring architecture patterns for modern cloud applications. Edit the outline and preview the publishing experience in demo mode.",
    subject: "Cloud",
    level: "Intermediate",
    language: "en",
    instructor: instructors.amara,
    rating: 0,
    learners: 0,
    duration: "4 weeks",
    skills: ["Architecture", "Reliability", "AWS"],
    outcomes: [
      "Compare common cloud design patterns",
      "Explain reliability tradeoffs",
    ],
    modules: curriculum("draft-cloud", "cloud design patterns", [
      "Resilient architecture",
      "Practical design decisions",
    ]),
    status: "draft",
    color: "#E8F4EF",
    art: "cloud",
    featured: false,
  },
];

function makeQuiz(course: Course, lessonId: string, final: boolean): Quiz {
  return {
    id: `${course.id}-${final ? "final" : "quiz"}`,
    courseId: course.id,
    lessonId,
    title: `${course.title}: ${final ? "final knowledge check" : "check your understanding"}`,
    questions:
      course.id === "python"
        ? [
            {
              id: "variables",
              prompt:
                "Which Python expression creates a list of three numbers?",
              options: [
                "[1, 2, 3]",
                "{1: 2: 3}",
                '"1, 2, 3"',
                "list = 1, 2, 3",
              ],
              correctIndex: 0,
              explanation:
                "Square brackets create a list. Lists keep items in order and can contain several values.",
            },
            {
              id: "functions",
              prompt: "What is the main purpose of defining a function?",
              options: [
                "To make every program longer",
                "To group reusable behavior with a clear purpose",
                "To stop all errors automatically",
                "To remove the need for variables",
              ],
              correctIndex: 1,
              explanation:
                "A function gives a useful piece of behavior a name so you can reuse it and reason about it independently.",
            },
            {
              id: "debugging",
              prompt:
                "What is a useful first step when an output is unexpected?",
              options: [
                "Delete the entire project",
                "Change every line at once",
                "Inspect the inputs and test one assumption at a time",
                "Ignore the result",
              ],
              correctIndex: 2,
              explanation:
                "Checking inputs and changing one assumption at a time makes it easier to identify and understand the cause.",
            },
          ]
        : [
            {
              id: "practice",
              prompt:
                "What is the best way to evaluate a new technical approach?",
              options: [
                "Assume it works because the demo looks good",
                "Define a goal, test assumptions, and compare measurable results",
                "Skip edge cases to save time",
                "Choose the most complicated solution",
              ],
              correctIndex: 1,
              explanation:
                "Clear goals and measurable checks help distinguish a useful approach from a promising-looking demonstration.",
            },
            {
              id: "evidence",
              prompt:
                "What should you do when the available evidence is insufficient?",
              options: [
                "Invent a confident answer",
                "Hide the uncertainty",
                "State the limitation and identify what to verify next",
                "Treat assumptions as verified facts",
              ],
              correctIndex: 2,
              explanation:
                "Good engineering makes uncertainty visible and identifies the next check needed to resolve it.",
            },
          ],
  };
}
export const quizzes: Quiz[] = courses
  .filter((course) => course.status === "published")
  .flatMap((course) => [
    makeQuiz(course, `${course.id}-4`, false),
    makeQuiz(course, `${course.id}-8`, true),
  ]);
export const initialEnrollments: Enrollment[] = [
  { courseId: "python", enrolledAt: "2026-10-01T00:00:00.000Z" },
];
export const initialProgress: StudentProgress[] = [
  { courseId: "python", completedLessonIds: ["python-1"] },
];
