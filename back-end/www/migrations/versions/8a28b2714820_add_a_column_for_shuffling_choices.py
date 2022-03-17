"""add a column for shuffling choices

Revision ID: 8a28b2714820
Revises: 3faf5fe54314
Create Date: 2022-03-17 15:54:43.090983

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8a28b2714820'
down_revision = '3faf5fe54314'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('question', sa.Column('shuffle_choices', sa.Boolean(), server_default=sa.text('false'), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('question', 'shuffle_choices')
    # ### end Alembic commands ###
