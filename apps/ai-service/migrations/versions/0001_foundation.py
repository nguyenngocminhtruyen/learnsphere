from alembic import op

revision = "0001"
down_revision = None


def upgrade() -> None:
    op.execute(
        "CREATE TABLE ai.foundation (id integer PRIMARY KEY CHECK (id = 1), marker text NOT NULL)"
    )
    op.execute("INSERT INTO ai.foundation VALUES (1, 'phase-0')")
    op.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON ai.foundation TO ai_app")


def downgrade() -> None:
    op.execute("DROP TABLE ai.foundation")
