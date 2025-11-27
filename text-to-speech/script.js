document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const textInput = document.getElementById('text-input');
    const voiceSelect = document.getElementById('voice-select');
    const modelSelect = document.getElementById('model-select');
    const apiKeyInput = document.getElementById('api-key');
    const generateBtn = document.getElementById('generate-btn');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const progressBar = document.getElementById('progress-bar');
    const progress = document.getElementById('progress');
    const timeDisplay = document.getElementById('time');
    const volumeSlider = document.getElementById('volume-slider');
    const downloadBtn = document.getElementById('download-btn');
    const player = document.getElementById('player');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    
    let audio = null;
    let audioUrl = null;
    let isPlaying = false;
    
    // 生成语音
    generateBtn.addEventListener('click', async function() {
        const text = textInput.value.trim();
        if (!text) {
            showMessage('请输入要转换的文字', 'error');
            return;
        }
        
        const voice = voiceSelect.value;
        const model = modelSelect.value;
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showMessage('请输入API密钥', 'error');
            return;
        }
        
        // 显示加载状态
        loading.style.display = 'block';
        player.classList.remove('active');
        hideMessages();
        
        try {
            // 调用实际的TTS API
            const audioBlob = await callTTSApi(text, voice, model, apiKey);
            
            // 创建音频对象
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            
            audioUrl = URL.createObjectURL(audioBlob);
            audio = new Audio(audioUrl);
            
            // 设置音频事件监听
            audio.addEventListener('loadedmetadata', function() {
                updateTimeDisplay();
            });
            
            audio.addEventListener('timeupdate', function() {
                updateProgress();
                updateTimeDisplay();
            });
            
            audio.addEventListener('ended', function() {
                isPlaying = false;
                playBtn.style.display = 'flex';
                pauseBtn.style.display = 'none';
            });
            
            // 设置音量
            audio.volume = volumeSlider.value / 100;
            
            // 显示播放器
            player.classList.add('active');
            loading.style.display = 'none';
            showMessage('语音生成成功！', 'success');
            
        } catch (error) {
            console.error('生成语音时出错:', error);
            loading.style.display = 'none';
            showMessage('生成语音时出错: ' + error.message, 'error');
        }
    });
    
    // 播放/暂停控制
    playBtn.addEventListener('click', function() {
        if (audio) {
            audio.play();
            isPlaying = true;
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'flex';
        }
    });
    
    pauseBtn.addEventListener('click', function() {
        if (audio) {
            audio.pause();
            isPlaying = false;
            playBtn.style.display = 'flex';
            pauseBtn.style.display = 'none';
        }
    });
    
    // 进度条控制
    progressBar.addEventListener('click', function(e) {
        if (!audio) return;
        
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    });
    
    // 音量控制
    volumeSlider.addEventListener('input', function() {
        if (audio) {
            audio.volume = volumeSlider.value / 100;
        }
    });
    
    // 下载音频
    downloadBtn.addEventListener('click', function() {
        if (audioUrl) {
            const a = document.createElement('a');
            a.href = audioUrl;
            a.download = 'speech.mp3';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    });
    
    // 更新进度条
    function updateProgress() {
        if (!audio || !audio.duration) return;
        
        const percent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = percent + '%';
    }
    
    // 更新时间显示
    function updateTimeDisplay() {
        if (!audio) return;
        
        const currentTime = formatTime(audio.currentTime);
        const duration = formatTime(audio.duration || 0);
        timeDisplay.textContent = `${currentTime} / ${duration}`;
    }
    
    // 格式化时间（秒 -> 分:秒）
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 显示消息
    function showMessage(message, type) {
        hideMessages();
        
        if (type === 'error') {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        } else {
            successMessage.textContent = message;
            successMessage.style.display = 'block';
        }
        
        // 3秒后自动隐藏消息
        setTimeout(hideMessages, 3000);
    }
    
    // 隐藏所有消息
    function hideMessages() {
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
    }
    
    // 调用实际的TTS API
    async function callTTSApi(text, voice, model, apiKey) {
        const apiUrl = 'http://tts.example.com/v1/audio/speech';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                input: text,
                voice: voice
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API请求失败');
        }
        
        return await response.blob();
    }
    
    // 初始化界面
    pauseBtn.style.display = 'none';
});