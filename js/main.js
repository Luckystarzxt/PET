// DOM 元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const compressionSection = document.getElementById('compressionSection');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');

let originalFile = null;
let maxWidth = 1920; // 默认最大宽度
let maxHeight = 1080; // 默认最大高度
let keepAspectRatio = true; // 保持宽高比

// 事件监听器
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--primary-color)';
    dropZone.style.backgroundColor = 'rgba(0, 122, 255, 0.05)';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border-color)';
    dropZone.style.backgroundColor = 'var(--surface-color)';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border-color)';
    dropZone.style.backgroundColor = 'var(--surface-color)';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageUpload(file);
    }
});

qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = `${e.target.value}%`;
    if (originalFile) {
        compressImage(originalFile, e.target.value / 100);
    }
});

// 处理图片上传
function handleImageUpload(file) {
    if (!isValidImageType(file)) {
        alert('请上传 JPG、PNG、GIF 或 WebP 格式的图片');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('文件大小不能超过 10MB');
        return;
    }
    
    originalFile = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        originalPreview.src = e.target.result;
        originalSize.textContent = formatFileSize(file.size);
        compressionSection.style.display = 'block';
        
        compressImage(file, qualitySlider.value / 100);
    };
    reader.readAsDataURL(file);
}

// 压缩图片
function compressImage(file, quality) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 计算新的尺寸
            let newWidth = img.width;
            let newHeight = img.height;
            
            // 如果图片尺寸超过最大限制，按比例缩小
            if (keepAspectRatio) {
                if (img.width > maxWidth || img.height > maxHeight) {
                    const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
                    newWidth = img.width * ratio;
                    newHeight = img.height * ratio;
                }
            } else {
                newWidth = Math.min(img.width, maxWidth);
                newHeight = Math.min(img.height, maxHeight);
            }
            
            // 设置画布尺寸
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            // 绘制图片
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            
            // 压缩并显示预览
            canvas.toBlob((blob) => {
                const compressedUrl = URL.createObjectURL(blob);
                compressedPreview.src = compressedUrl;
                compressedSize.textContent = formatFileSize(blob.size);
                
                // 显示压缩率
                const compressionRatio = ((1 - blob.size / file.size) * 100).toFixed(1);
                compressedSize.textContent += ` (节省 ${compressionRatio}%)`;
                
                // 更新下载按钮
                downloadBtn.onclick = () => {
                    const link = document.createElement('a');
                    link.href = compressedUrl;
                    // 添加压缩信息到文件名
                    const extension = file.name.split('.').pop();
                    const baseName = file.name.slice(0, -(extension.length + 1));
                    link.download = `${baseName}_compressed_${quality*100}q.${extension}`;
                    link.click();
                };
            }, file.type, quality);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 添加文件类型检查
function isValidImageType(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
} 