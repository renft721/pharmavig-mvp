"""Create initial schema for pharmacovigilance database

Revision ID: 001
Revises:
Create Date: 2026-05-14 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create ENUM types
    sourceType = postgresql.ENUM('aerzteblatt', 'pdf', 'web', 'ema', 'faers', 'pubmed', name='sourcetype')
    sourceType.create(op.get_bind(), checkfirst=True)

    findingStatus = postgresql.ENUM('pending_review', 'under_review', 'approved', 'rejected', name='findingstatus')
    findingStatus.create(op.get_bind(), checkfirst=True)

    severity = postgresql.ENUM('mild', 'moderate', 'severe', 'fatal', name='severity')
    severity.create(op.get_bind(), checkfirst=True)

    studyType = postgresql.ENUM('rct', 'observational', 'case_report', 'review', 'other', name='studytype')
    studyType.create(op.get_bind(), checkfirst=True)

    auditAction = postgresql.ENUM('insert', 'update', 'delete', 'approve', 'reject', 'comment', name='auditaction')
    auditAction.create(op.get_bind(), checkfirst=True)

    userRole = postgresql.ENUM('analyst', 'qppv', 'admin', name='userrole')
    userRole.create(op.get_bind(), checkfirst=True)

    # Create tables
    op.create_table(
        'drugs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('active_ingredient', sa.String(255), nullable=False),
        sa.Column('brand_names', sa.JSON(), nullable=True),
        sa.Column('atc_code', sa.String(10), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('active_ingredient')
    )
    op.create_index('ix_drugs_active_ingredient', 'drugs', ['active_ingredient'])

    op.create_table(
        'sources',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('url', sa.String(512), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('source_type', postgresql.ENUM('aerzteblatt', 'pdf', 'web', 'ema', 'faers', 'pubmed', name='sourcetype'), nullable=False),
        sa.Column('published_date', sa.DateTime(), nullable=True),
        sa.Column('language', sa.String(5), nullable=True),
        sa.Column('accessed_date', sa.DateTime(), nullable=False),
        sa.Column('raw_content', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('url')
    )
    op.create_index('ix_sources_url', 'sources', ['url'])

    op.create_table(
        'findings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('drug_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('source_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('adverse_reaction', sa.String(255), nullable=False),
        sa.Column('frequency', sa.String(100), nullable=True),
        sa.Column('severity', postgresql.ENUM('mild', 'moderate', 'severe', 'fatal', name='severity'), nullable=True),
        sa.Column('affected_population', sa.JSON(), nullable=True),
        sa.Column('author_conclusion', sa.Text(), nullable=True),
        sa.Column('study_type', postgresql.ENUM('rct', 'observational', 'case_report', 'review', 'other', name='studytype'), nullable=False),
        sa.Column('status', postgresql.ENUM('pending_review', 'under_review', 'approved', 'rejected', name='findingstatus'), nullable=False),
        sa.Column('extracted_date', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['drug_id'], ['drugs.id'], ),
        sa.ForeignKeyConstraint(['source_id'], ['sources.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_findings_drug_id', 'findings', ['drug_id'])
    op.create_index('ix_findings_source_id', 'findings', ['source_id'])
    op.create_index('ix_findings_status', 'findings', ['status'])

    op.create_table(
        'finding_comments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('finding_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('reviewer_name', sa.String(255), nullable=False),
        sa.Column('reviewer_role', postgresql.ENUM('analyst', 'qppv', 'admin', name='userrole'), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('decision', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['finding_id'], ['findings.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_finding_comments_finding_id', 'finding_comments', ['finding_id'])

    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('table_name', sa.String(100), nullable=False),
        sa.Column('record_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('action', postgresql.ENUM('insert', 'update', 'delete', 'approve', 'reject', 'comment', name='auditaction'), nullable=False),
        sa.Column('old_value', sa.JSON(), nullable=True),
        sa.Column('new_value', sa.JSON(), nullable=True),
        sa.Column('user_id', sa.String(100), nullable=True),
        sa.Column('user_name', sa.String(255), nullable=True),
        sa.Column('user_role', postgresql.ENUM('analyst', 'qppv', 'admin', name='userrole'), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_audit_logs_table_name', 'audit_logs', ['table_name'])
    op.create_index('ix_audit_logs_record_id', 'audit_logs', ['record_id'])
    op.create_index('ix_audit_logs_action', 'audit_logs', ['action'])
    op.create_index('ix_audit_logs_timestamp', 'audit_logs', ['timestamp'])


def downgrade() -> None:
    # Drop tables in reverse order of creation
    op.drop_index('ix_audit_logs_timestamp', table_name='audit_logs')
    op.drop_index('ix_audit_logs_action', table_name='audit_logs')
    op.drop_index('ix_audit_logs_record_id', table_name='audit_logs')
    op.drop_index('ix_audit_logs_table_name', table_name='audit_logs')
    op.drop_table('audit_logs')

    op.drop_index('ix_finding_comments_finding_id', table_name='finding_comments')
    op.drop_table('finding_comments')

    op.drop_index('ix_findings_status', table_name='findings')
    op.drop_index('ix_findings_source_id', table_name='findings')
    op.drop_index('ix_findings_drug_id', table_name='findings')
    op.drop_table('findings')

    op.drop_index('ix_sources_url', table_name='sources')
    op.drop_table('sources')

    op.drop_index('ix_drugs_active_ingredient', table_name='drugs')
    op.drop_table('drugs')

    # Drop ENUM types
    postgresql.ENUM('userrole').drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM('auditaction').drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM('studytype').drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM('severity').drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM('findingstatus').drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM('sourcetype').drop(op.get_bind(), checkfirst=True)
