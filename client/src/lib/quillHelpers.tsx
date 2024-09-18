import Quill from "quill";

export function saveToServer(file:any, editor: Quill) {
    const formData = new FormData();
    formData.append('image', file);

    fetch('/upload_image', { // This URL needs to handle image uploads
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(result => {
            insertToEditor(result.path, editor);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

export function insertToEditor(url: string, editor: Quill) {
    const range = editor.getSelection();
    if (range) {
        editor.insertEmbed(range.index, 'image', url);
    }
}


export function selectLocalImage(editor: Quill) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files![0];
      saveToServer(file, editor);
    };
}
