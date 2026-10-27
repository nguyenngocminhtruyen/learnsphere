CREATE TABLE lms.foundation (id integer PRIMARY KEY CHECK (id = 1), marker text NOT NULL);
INSERT INTO lms.foundation VALUES (1, 'phase-0');
GRANT SELECT, INSERT, UPDATE, DELETE ON lms.foundation TO lms_app;
