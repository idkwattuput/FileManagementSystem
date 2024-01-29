<template>
	<div>
		<h1>Your Files</h1>

		<!-- Display user's files -->
		<div v-if="files.length > 0">
			<ul>
				<li v-for="file in files" :key="file.id">
					{{ file.filename }}
				</li>
			</ul>
		</div>

		<!-- Display message if no files -->
		<div v-else>
			<p>No files yet. Upload some files!</p>
		</div>

		<!-- Add file form -->
		<form @submit.prevent="uploadFile">
			<label for="file">Choose a file:</label>
			<input type="file" name="file" v-on:change="handleFileChange" />
			<button type="submit" :disabled="!selectedFile">Upload File</button>
		</form>

		<!-- Add folder form -->
		<form @submit.prevent="createFolder">
			<label for="folderName">Enter folder name:</label>
			<input type="text" v-model="folderName" />
			<button type="submit">Create Folder</button>
		</form>

		<label for="folder">Select a folder:</label>
		<select v-model="selectedFolderId">
			<option v-for="folder in folders" :key="folder.id" :value="folder.id">{{ folder.name }}</option>
		</select>
	</div>
</template>

<script>
export default {
	data() {
		return {
			files: [], // Array to store user's files
			selectedFile: null, // Store the selected file for upload
			folderName: '', // Store folder name for creating a folder
			selectedFolderId: null,
			folders: [], // Array to store user's folders
		};
	},
	mounted() {
		// Fetch user's files when the component is mounted
		this.fetchUserFiles();
		this.fetchUserFolders();
	},
	methods: {
		handleFileChange(event) {
			console.log('File selected:', event.target.files[0]);
			this.selectedFile = event.target.files[0];
		},
		async fetchUserFiles() {
			try {
				const response = await fetch('http://localhost:5000/file', { credentials: 'include' }); // Replace with your actual API endpoint
				const data = await response.json();

				if (response.ok) {
					this.files = data;
				} else {
					console.error('Error fetching files:', data.message);
				}
			} catch (error) {
				console.error('Error fetching files:', error);
			}
		},
		async uploadFile() {
			try {
				const formData = new FormData();
				formData.append('file', this.selectedFile);

				// Log the FormData content
				console.log('FormData:', formData);

				// Check if the user has selected a folder
				const folderIdParam = this.selectedFolderId ? `/${this.selectedFolderId}` : '';
				console.log('FolderIdParam:', folderIdParam);

				const response = await fetch(`http://localhost:5000/file/upload${folderIdParam}`, {
					method: 'POST',
					body: formData,
					credentials: 'include',
				});

				const data = await response.json();

				if (response.ok) {
					console.log('File uploaded successfully:', data);
					// Optionally, you can update the displayed files or perform other actions.
				} else {
					console.error('File upload failed:', data.message);
					// Handle the error and provide feedback to the user.
				}
			} catch (error) {
				console.error('Error uploading file:', error);
				// Handle unexpected errors, such as network issues.
			}
		},

		async createFolder() {
			try {
				const response = await fetch('http://localhost:5000/folder/create-folder', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						folderName: this.folderName,
					}),
					credentials: 'include',
				});

				const data = await response.json();

				if (response.ok) {
					console.log('Folder created successfully:', data);
					// Optionally, you can update the displayed folders or perform other actions.
				} else {
					console.error('Folder creation failed:', data.message);
					// Handle the error and provide feedback to the user.
				}
			} catch (error) {
				console.error('Error creating folder:', error);
				// Handle unexpected errors, such as network issues.
			}
		},
		async fetchUserFolders() {
			try {
				const response = await fetch('http://localhost:5000/folder/get-user-folders', { credentials: 'include' }); // Replace with your actual API endpoint
				const data = await response.json();

				if (response.ok) {
					this.folders = data;
				} else {
					console.error('Error fetching folders:', data.message);
				}
			} catch (error) {
				console.error('Error fetching folders:', error);
			}
		},
	},
};
</script>

<style>
/* Add your styles here */
</style>
