CREATE TABLE files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    mimetype VARCHAR(100) NOT NULL,
    filedata LONGBLOB NOT NULL,
    folder_id INT,
    user_id INT,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE folders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_folder_id INT,
    user_folder_id INT, 
    FOREIGN KEY (user_folder_id) REFERENCES users(id),
    UNIQUE KEY unique_folder_name (name, parent_folder_id, user_folder_id)
);
