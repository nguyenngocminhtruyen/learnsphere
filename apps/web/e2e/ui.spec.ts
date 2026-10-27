import { test as base, expect, type Page } from "@playwright/test";
import en from "../messages/en.json";
import vi from "../messages/vi.json";
import { quizzes } from "../lib/fixtures";

// Every browser scenario must work with only the Next.js origin available.
const test = base.extend<{ isolatedDemo: void }>({
  isolatedDemo: [async ({ context, baseURL }, use) => {
    const unexpected: string[] = [];
    const origin = new URL(baseURL!).origin;
    await context.route(/^https?:\/\//, async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== origin || /^\/(?:api|internal|v1)(?:\/|$)/.test(url.pathname)) {
        unexpected.push(url.href);
        await route.abort();
      } else {
        await route.continue();
      }
    });
    await use();
    expect(unexpected, "demo must not request backend or external services").toEqual([]);
  }, { auto: true }],
});

const routes = [
  "/",
  "/courses",
  "/courses/python-for-everyone",
  "/my-learning",
  "/learn/python/python-1",
  "/learn/python/python-2",
  "/quizzes/python-quiz",
  "/login",
  "/register",
  "/admin",
  "/admin/courses",
  "/admin/courses/new",
  "/admin/courses/python/edit",
  "/admin/courses/python/builder",
  "/admin/ai-studio",
];
async function noOverflow(page: Page) {
  const size = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(size.scroll).toBeLessThanOrEqual(size.width + 1);
}
for (const width of [1440, 768, 375]) {
  test(`all screens render with no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(
        page.getByRole("heading", { level: 1 }).first(),
      ).toBeVisible();
      await noOverflow(page);
    }
    expect(errors).toEqual([]);
  });
}

test("catalog search, combined filters, sorting, empty state and header search", async ({
  page,
}) => {
  await page.goto("/courses");
  await expect(page.locator(".course-card")).toHaveCount(6);
  await page
    .getByRole("textbox", { name: en["catalog.search"] })
    .fill("Python");
  await expect(page.locator(".course-card")).toHaveCount(2);
  await page.getByRole("button", { name: en["catalog.clearSearch"] }).click();
  await page
    .getByRole("radio", { name: en["subject.AI"], exact: true })
    .check();
  await expect(page.locator(".course-card")).toHaveCount(2);
  await page
    .getByLabel(en["catalog.language"], { exact: true })
    .selectOption("vi");
  await expect(page.locator(".course-title")).toHaveText([
    "Ứng dụng LLM trong thực tế",
  ]);
  await page
    .getByRole("radio", { name: en["level.Beginner"], exact: true })
    .check();
  await expect(page.getByText(en["catalog.emptyTitle"])).toBeVisible();
  await page
    .getByRole("button", { name: en["catalog.reset"], exact: true })
    .last()
    .click();
  await page
    .getByRole("combobox", { name: en["catalog.sort"] })
    .selectOption("title");
  const titles = await page.locator(".course-title").allTextContents();
  expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
  await page
    .getByRole("textbox", { name: en["nav.search"], exact: true })
    .fill("Spring Boot");
  await page.locator(".header-search").getByRole("button").click();
  await expect(page.locator(".course-title")).toHaveText([
    "Build Better Backends with Spring Boot",
  ]);
  await expect(
    page.getByRole("textbox", { name: en["catalog.search"] }),
  ).toHaveValue("Spring Boot");
});

test("student enrollment, lessons, notes, resource, tutor, quiz and completed progress", async ({
  page,
}) => {
  await page.goto("/learn/java/java-1");
  await expect(page.getByText(en["learning.enrollTitle"])).toBeVisible();
  await page.goto("/courses/python-for-everyone");
  await page
    .getByRole("button", { name: en["course.continue"], exact: true })
    .click();
  await expect(page).toHaveURL(/\/learn\/python\/python-1$/);
  await page.getByRole("button", { name: en["learning.playPreview"] }).click();
  await expect(
    page.getByRole("button", { name: en["learning.pausePreview"] }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: en["learning.notes"], exact: true })
    .click();
  await page
    .getByLabel(en["learning.notesLabel"])
    .fill("Practice functions after this lesson.");
  await page
    .getByRole("button", { name: en["learning.resources"], exact: true })
    .click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "TXT", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("python-1-companion.txt");
  await page
    .getByRole("button", { name: en["learning.notes"], exact: true })
    .click();
  await expect(page.getByLabel(en["learning.notesLabel"])).toHaveValue(
    "Practice functions after this lesson.",
  );
  await page
    .getByLabel(en["learning.tutorQuestion"])
    .fill("How do I practice this?");
  await page.getByRole("button", { name: en["learning.tutorSend"] }).click();
  await expect(page.getByText(en["learning.tutorReply"])).toBeVisible();
  await page
    .getByRole("button", { name: en["learning.collapseTutor"] })
    .click();
  await expect(page.locator("#tutor-content")).toHaveCount(0);
  await page.getByRole("button", { name: en["learning.expandTutor"] }).click();
  for (let index = 2; index <= 8; index++) {
    await page
      .locator(`.curriculum-item[href='/learn/python/python-${index}']`)
      .click();
    if (index % 4) {
      await page
        .getByRole("button", { name: en["learning.markComplete"], exact: true })
        .click();
      await expect(
        page.getByRole("button", {
          name: en["learning.lessonComplete"],
          exact: true,
        }),
      ).toBeDisabled();
    } else {
      await page
        .getByRole("link", { name: en["learning.startQuiz"], exact: true })
        .click();
      await page
        .getByRole("button", { name: en["quiz.submit"], exact: true })
        .click();
      await expect(page.locator("#main-content").getByRole("alert")).toHaveText(
        en["quiz.required"],
      );
      const quiz = quizzes.find(
        (item) => item.id === `python-${index === 4 ? "quiz" : "final"}`,
      )!;
      for (const question of quiz.questions)
        await page
          .getByRole("radio", {
            name: question.options[question.correctIndex],
            exact: false,
          })
          .check();
      await page
        .getByRole("button", { name: en["quiz.submit"], exact: true })
        .click();
      await expect(page.locator(".quiz-score")).toHaveText("100%");
      await page
        .getByRole("link", { name: en["quiz.returnLesson"], exact: true })
        .click();
    }
  }
  await page
    .getByRole("link", { name: en["learning.back"], exact: true })
    .click();
  await page
    .getByRole("button", { name: new RegExp(`^${en["learning.completed"]}`) })
    .click();
  await expect(page.locator(".learning-course-card")).toHaveCount(1);
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  await page.goto("/courses/aws-cloud-foundations");
  await page
    .getByRole("button", { name: en["course.enroll"], exact: true })
    .click();
  await expect(page).toHaveURL(/\/learn\/cloud\/cloud-1$/);
});

test("admin edits, explicitly publishes and generates a reviewed draft with error recovery", async ({
  page,
}) => {
  await page.goto("/admin/courses/new");
  await page
    .getByLabel(en["admin.courseTitle"], { exact: true })
    .fill("Responsible AI Workshop");
  await page
    .getByLabel(en["admin.subtitle"], { exact: true })
    .fill("Explore useful ideas with evidence.");
  await page
    .getByLabel(en["admin.description"], { exact: true })
    .fill(
      "A practical learning workshop about responsible AI, clear evaluation and thoughtful experimentation.",
    );
  await page
    .getByLabel(en["admin.skills"], { exact: true })
    .fill("AI, Evaluation");
  await expect(
    page.getByLabel(en["admin.skills"], { exact: true }),
  ).toHaveValue("AI, Evaluation");
  await page
    .getByRole("button", { name: en["admin.preview"], exact: true })
    .click();
  await page
    .getByRole("button", { name: en["admin.publish"], exact: true })
    .click();
  await expect(page.locator("#main-content").getByRole("alert")).toHaveText(
    en["admin.validation"],
  );
  await page
    .getByRole("button", { name: en["admin.closePreview"], exact: true })
    .click();
  await page
    .getByRole("button", { name: en["admin.addModule"], exact: true })
    .click();
  await page
    .getByLabel(`${en["admin.moduleTitle"]} 1`, { exact: true })
    .fill("From idea to evidence");
  await page
    .getByRole("button", { name: en["admin.addLesson"], exact: true })
    .click();
  await page.locator(".editor-lesson summary").click();
  await page
    .getByLabel(en["admin.lessonTitle"], { exact: true })
    .fill("Ask a better question");
  await page
    .getByLabel(en["admin.lessonBody"], { exact: true })
    .fill(
      "Start by defining your goal and writing down the assumptions you need to test.",
    );
  await page
    .getByRole("button", { name: en["admin.save"], exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/courses\/course-.+\/edit/);
  await page
    .getByRole("button", { name: en["admin.preview"], exact: true })
    .click();
  await page
    .getByRole("button", { name: en["admin.publish"], exact: true })
    .click();
  await expect(page.locator("#main-content").getByRole("status")).toContainText(
    en["admin.publishedSuccess"],
  );
  await page
    .locator(".admin-sidebar")
    .getByRole("link", { name: en["admin.courses"], exact: true })
    .click();
  await page
    .getByRole("textbox", { name: en["admin.search"] })
    .fill("Responsible AI");
  await expect(page.locator(".data-table tbody tr")).toHaveCount(1);
  await page
    .locator(".admin-sidebar")
    .getByRole("link", { name: en["admin.studio"], exact: true })
    .click();
  await page.locator("#source-upload").setInputFiles({
    name: "unsupported.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("demo"),
  });
  await expect(page.locator("#main-content").getByRole("alert")).toHaveText(
    en["admin.fileError"],
  );
  await page.locator("#source-upload").setInputFiles({
    name: "empty.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.alloc(0),
  });
  await expect(page.locator("#main-content").getByRole("alert")).toHaveText(
    en["admin.fileError"],
  );
  await page
    .getByRole("button", { name: en["admin.sampleSource"], exact: true })
    .click();
  await page
    .getByRole("button", { name: en["admin.continue"], exact: true })
    .click();
  await page
    .getByLabel(en["admin.courseTitle"], { exact: true })
    .fill("Grounded AI Essentials");
  await page
    .getByRole("combobox", { name: en["admin.language"], exact: true })
    .selectOption("vi");
  await page.getByLabel(en["admin.simulateFailure"]).check();
  await page
    .getByRole("button", { name: en["admin.generate"], exact: true })
    .click();
  await expect(page.locator("#main-content").getByRole("alert")).toHaveText(
    en["admin.generationError"],
  );
  await page.getByLabel(en["admin.simulateFailure"]).uncheck();
  await page
    .getByRole("button", { name: en["admin.generate"], exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: en["admin.approve"], exact: true }),
  ).toBeDisabled();
  await expect(
    page
      .locator(".generated-curriculum")
      .getByText(vi["admin.generatedModuleOne"], { exact: true }),
  ).toBeVisible();
  await page.getByText(en["admin.reviewLesson"], { exact: true }).click();
  await page.getByText(en["admin.reviewQuiz"], { exact: true }).click();
  await page.getByLabel(en["admin.reviewCheck"]).check();
  await page
    .getByRole("button", { name: en["admin.approve"], exact: true })
    .click();
  await expect(page.locator("#main-content").getByRole("status")).toContainText(
    en["admin.approved"],
  );
  await page.getByRole("link", { name: en["admin.edit"], exact: true }).click();
  await expect(
    page.getByLabel(en["admin.courseTitle"], { exact: true }),
  ).toHaveValue("Grounded AI Essentials");
  await expect(
    page
      .locator(".panel-heading")
      .first()
      .getByText(en["admin.draft"], { exact: true }),
  ).toBeVisible();
});

test("auth rejects invalid inputs and clears demo credentials without persistence", async ({
  page,
}) => {
  await page.goto("/register");
  await page
    .getByRole("button", { name: en["auth.submitRegister"], exact: true })
    .click();
  await expect(page.locator("#main-content").getByRole("alert")).toHaveCount(3);
  await page.getByLabel(en["auth.name"], { exact: true }).fill("Demo Learner");
  await page
    .getByLabel(en["auth.email"], { exact: true })
    .fill("learner@example.test");
  await page
    .getByLabel(en["auth.password"], { exact: true })
    .fill("temporary-demo-input");
  await page.getByRole("button", { name: en["auth.showPassword"] }).click();
  await expect(
    page.getByLabel(en["auth.password"], { exact: true }),
  ).toHaveAttribute("type", "text");
  await page
    .getByRole("button", { name: en["auth.submitRegister"], exact: true })
    .click();
  await expect(page.locator("#main-content").getByRole("status")).toContainText(
    en["auth.success"],
  );
  await expect(
    page.getByLabel(en["auth.password"], { exact: true }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    })),
  ).toEqual({ local: [], session: [] });
  await page
    .getByRole("link", { name: en["auth.openWorkspace"], exact: true })
    .click();
  await expect(page).toHaveURL(/\/my-learning$/);
});

test("language switch, keyboard access, invalid paths and no backend requests", async ({
  page,
}) => {
  const forbidden: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      ["8080", "8000", "4566"].includes(url.port) ||
      /\/internal\/|\/v1\/|amazonaws\.com/.test(url.href)
    )
      forbidden.push(url.href);
  });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: en["nav.skip"], exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await page.locator(".language-switch").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    vi["home.headlineA"],
  );
  await page
    .locator(".desktop-nav")
    .getByRole("link", { name: vi["nav.myLearning"], exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    vi["learning.title"],
  );
  await page
    .locator(".desktop-nav")
    .getByRole("link", { name: vi["nav.admin"], exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    vi["admin.welcome"],
  );
  await page.setViewportSize({ width: 375, height: 812 });
  await noOverflow(page);
  await page.locator(".menu-toggle").click();
  await expect(page.locator("#mobile-navigation")).toBeVisible();
  await page
    .locator("#mobile-navigation")
    .getByRole("link", { name: vi["nav.courses"], exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    vi["catalog.title"],
  );
  await page
    .getByRole("button", { name: vi["catalog.filters"], exact: true })
    .click();
  await page
    .getByRole("radio", { name: vi["subject.Cloud"], exact: true })
    .check();
  await expect(page.locator(".course-card")).toHaveCount(1);
  await page.locator(".language-switch").click();
  await page.goto("/courses/unknown-course");
  await expect(page.getByText(en["course.notFound"])).toBeVisible();
  await page.goto("/learn/python/not-a-lesson");
  await expect(page.getByText(en["learning.unknownTitle"])).toBeVisible();
  await page.goto("/quizzes/not-a-quiz");
  await expect(page.getByText(en["quiz.notFound"])).toBeVisible();
  await page.goto("/courses/python-for-everyone");
  await page
    .getByRole("tab", { name: en["course.overview"], exact: true })
    .focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: en["course.curriculum"], exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("tab", { name: en["course.curriculum"], exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: en["course.instructor"], exact: true }),
  ).toBeFocused();
  expect(forbidden).toEqual([]);
});

test("demo access forms cannot submit credentials when JavaScript is disabled", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const route of ["/login", "/register"]) {
    await page.goto(
      `${process.env.UI_BASE_URL || "http://localhost:3100"}${route}`,
    );
    await expect(
      page.getByLabel(en["auth.email"], { exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByLabel(en["auth.password"], { exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name:
          route === "/login"
            ? en["auth.submitLogin"]
            : en["auth.submitRegister"],
        exact: true,
      }),
    ).toBeDisabled();
    await expect(
      page.getByText(en["auth.jsRequired"], { exact: true }),
    ).toBeVisible();
  }
  await context.close();
});
