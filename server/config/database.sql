-- Users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Folders
CREATE TABLE folders (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    parent_folder_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_folder_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_parent_folder
        FOREIGN KEY (parent_folder_id)
        REFERENCES folders(id)
        ON DELETE CASCADE
);

-- Files
CREATE TABLE files (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    storage_path TEXT NOT NULL,
    storage_url TEXT,
    user_id BIGINT NOT NULL,
    folder_id BIGINT,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_file_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_file_folder
        FOREIGN KEY (folder_id)
        REFERENCES folders(id)
        ON DELETE SET NULL
);

-- Permissions
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    file_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_permission_file
        FOREIGN KEY (file_id)
        REFERENCES files(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_permission_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT check_permission_role
        CHECK (role IN ('owner', 'viewer', 'editor')),

    CONSTRAINT unique_file_user_permission
        UNIQUE (file_id, user_id)     
);

-- File Shares
CREATE TABLE file_shares (
    id BIGSERIAL PRIMARY KEY,
    file_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    share_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_share_file
        FOREIGN KEY (file_id)
        REFERENCES files(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_share_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE CASCADE
);