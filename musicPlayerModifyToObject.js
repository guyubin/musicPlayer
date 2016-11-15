/*
css3 动画资料, 这篇文章几乎是最全面最方便的, 了解原理
http://www.ruanyifeng.com/blog/2014/02/css_transition_and_animation.html

css3 动画工具, 这是一个方便的动画工具
https://daneden.github.io/animate.css/

css3 动画生成器, 这是一个做动画的玩具
http://cssanimate.com/

本次作业是给播放器加上各种动态效果, 使用 css3 动画
最好使用 animate.css 这个库, 方便好用
*/
// 调试函数log
var log = function() {
    console.log.apply(console, arguments)
}

var insertplayer = function(where) {
    var t = `
            <div class="singName">歌曲名</div>
            <div class="author">歌者名</div>
            <hr class="hr middle" />
            <img class="singJpg" src="" alt="" />
            <audio id='id-audio' autoplay="autoplay"> <!-- 加上 controls 可以有浏览器默认的播放器图像-->
                <source />
            </audio>
            <div class="shoucang">
                <span class="glyphicon glyphicon-heart"></span>
                <span class="glyphicon glyphicon-download-alt"></span>
                <span class="glyphicon glyphicon-comment"></span>
            </div>
            <div class="play-progress-bar">
                <span id="id-time-right">00:00</span>
                <input id="id-progress-bar" type="range" name="name" value="">
                <span id="id-time-left">00:00</span>
            </div>
            <div class="play-control">
                <button class="play-control-mode" type="button" name="button" data-mode="loop"><i class="fa fa-refresh" aria-hidden="true"></i></button>
                <button class="play-control-prev" type="button" name="button"><i class="fa fa-step-backward" aria-hidden="true"></i></button>
                <button id="play-control-play-or-pause" class="play-control-play" type="button" name="button"><i class="fa fa-play" aria-hidden="true"></i></button>
                <button class="play-control-next" type="button" name="button"><i class="fa fa-step-forward" aria-hidden="true"></i></button>
                <button class="displayList" type="button" name="button"><i class="fa fa-list-ul" aria-hidden="true"></i></button>
            </div>
            <div class="vol-progress-bar">
                <span id="id-vol">volume</span>
                <input id="id-vol-progress-bar" type="range" name="name" value="">
            </div>
            <div class="popWindow">
                <div class="back"></div>
                <div class="content">
                    <div class="title">Play List</div>
                    <hr />
                    <div class="play-list"></div>
                </div>
            </div>

            `
    var toInsertAfter = document.querySelector(where)
    toInsertAfter.insertAdjacentHTML('afterbegin', t)
}

var playAudioObject = function(givenPlayList) {
    this.list = givenPlayList
    this.mode = ''
    this.currentList = []
    this.currentDisplayListDiv = document.querySelector('.play-list')
    this.audio = document.querySelector('#id-audio')
    this.source = document.querySelector('source')
    this.progressBar = document.querySelector('#id-progress-bar')
    this.playControl = document.querySelector('.play-control')
    this.modeButton = document.querySelector('.play-control-mode')
    this.controlButton = document.querySelector('#play-control-play-or-pause')
    this.spanLeft = document.querySelector('#id-time-left')
    this.spanRight = document.querySelector('#id-time-right')
    this.muteDiv = document.querySelector('.vol-progress-bar')
    this.muteSpan = document.querySelector('#id-vol')
    this.volProgressBar = document.querySelector('#id-vol-progress-bar')
    this.singNameDiv = document.querySelector('.singName')
    this.authorDiv = document.querySelector('.author')
    this.singJpg = document.querySelector('.singJpg')
    this.displayListControl = document.querySelector('.displayList')
}

//////////////////////////////////////////////////////////////////////
// 初始化部分
playAudioObject.prototype.insertPlayListHTML = function() {
    // 插入播放列表
    var t = ``
    var len = this.list.length
    for (var i = 0; i < len; i++) {
        var index = this.list[i].indexOf('.')
        var str = this.list[i].substr(0, index)
        t = t + `
        <div class="play-list-item" data-song="${this.list[i]}">
            <span class="singNameInList">${str}</span>
        </div>
        <hr />
        `
    }
    this.currentDisplayListDiv.insertAdjacentHTML('beforeend', t)
}
playAudioObject.prototype.initPlayMode = function() {
    this.mode = 'loop'
}
playAudioObject.prototype.initCurrentPlayList = function() {
    var len = this.list.length
    this.currentList.length = 0
    for (var i = 0; i < len; i++) {
        this.currentList.push(this.list[i])
    }
}
playAudioObject.prototype.initAudio = function() {
    this.source.src = this.currentList[0]
    this.audio.src = this.currentList[0]
    this.setSingNameAndAuthor(0)

}
playAudioObject.prototype.initPlayStateAndProgressBar = function() {
    this.audio.pause()
    this.progressBar.value = 0
}
playAudioObject.prototype.initVolProgressBar = function() {
        this.volProgressBar.value = this.audio.volume * 100
    }
    ////////////////////////////////////////////////////////////////////
    // 全部的事件部分
playAudioObject.prototype.bindEventToPlayList = function() {

    var PlayListDblclickFunction = function(event) {
        var target = event.target
        var parent = target.parentElement

        var selectSong = parent.getAttribute('data-song')

        if (selectSong === null) {
            selectSong = target.getAttribute('data-song')
        }
            // 获取指定播放歌曲在当前播放列表中的索引值
        for (var i = 0; i < this.currentList.length; i++) {
            if (selectSong === this.currentList[i]) {
                break;
            }
        }
        // 获取当前播放歌曲
        var s = decodeURI(this.source.src)

        var start = s.lastIndexOf('/')
        var src = s.substr(start + 1)
            // 判断当前播放歌曲是否与指定歌曲相同
        if (src === selectSong) {
            // 相同则当前歌曲重新播放
            this.audio.currentTime = 0
            this.setSingNameAndAuthor(i)
        } else {
            // 不同则播放当前指定歌曲
            this.source.src = selectSong
            this.audio.src = selectSong
            this.setSingNameAndAuthor(i)
        }
    }
    var bindFunction = PlayListDblclickFunction.bind(this) // 依靠bind来解决这个问题

    this.currentDisplayListDiv.addEventListener('click', bindFunction)
}
playAudioObject.prototype.bindEventToSingEnd = function() {
    var singEndedFunction = function() {
        var s = decodeURI(this.source.src)
        var start = s.lastIndexOf('/')
        var src = s.substr(start + 1)
            // 获取当前播放歌曲在播放列表中的位置
        var playList = this.currentList

        var len = playList.length
        for (var i = 0; i < len; i++) {
            if (playList[i] === src) {
                break;
            }
        }
        // 获取后一首歌的歌名并赋值
        var nextIndex = (i + len + 1) % len
        var nextSong = playList[nextIndex]
        this.source.src = nextSong
        this.audio.src = nextSong
        this.setSingNameAndAuthor(nextIndex)
    }

    var bindFunction = singEndedFunction.bind(this)

    this.audio.addEventListener('ended', bindFunction)
}
playAudioObject.prototype.setNextSong = function() {
    var playList = this.list
    var len = playList.length
    if (this.mode === 'loop') {
        var playListLoop = []
        for (var i = 0; i < len; i++) {
            playListLoop.push(playList[i])
        }
        var playListReturn = playListLoop
    } else if (this.mode === 'random') {
        var playListRandom = []
        for (var i = 0; i < len; i++) {
            playListRandom.push(playList[i])
        }
        for (var i = 0, l = len; i < l; i++) {
            var n = parseInt(Math.random() * l);
            playListRandom[i] = [playListRandom[n], playListRandom[n] = playListRandom[i]][0]; //执行随机位置调换
        }
        var playListReturn = playListRandom
    } else if (this.mode === 'single') {
        var s = decodeURI(this.source.src)
        var start = s.lastIndexOf('/')
        var src = s.substr(start + 1)
        var playListSingle = []
        playListSingle.push(src)
        var playListReturn = playListSingle
    }
    return playListReturn
}
playAudioObject.prototype.setSingNameAndAuthor = function(index) {
    log('index', index)
    var firstBlank = this.currentList[index].indexOf(' ')
    var secondBlank = this.currentList[index].lastIndexOf(' ')
    var firstDot = this.currentList[index].indexOf('.')
    var author = this.currentList[index].substr(0, firstBlank)
    var singName = this.currentList[index].substr(secondBlank + 1, firstDot - 1 - secondBlank)

    this.singNameDiv.innerHTML = singName
    this.authorDiv.innerHTML = author
    this.setSingJpg(index)

    var displayPlayList = document.querySelectorAll('.play-list-item')
    for (var i = 0; i < displayPlayList.length; i++) {
        var displayPlayListItemName = displayPlayList[i].getAttribute('data-song')
        var displayPlayListItemNameSlice = displayPlayListItemName.substr(0, displayPlayListItemName.indexOf('.'))
        displayPlayList[i].innerHTML = `<span class="singNameInList">${displayPlayListItemNameSlice}</span>`
        if (this.currentList[index] === displayPlayListItemName) {
            var currentPlayIndex = i;
        }
    }

    displayPlayList[currentPlayIndex].innerHTML = `<span class="singNameInList" style="color:red;">${singName}</span> <span class="pull-right" style="color:red;margin-right:1em;"><i class="fa fa-volume-up" aria-hidden="true"></i></span>`
}
playAudioObject.prototype.setSingJpg = function(index) {
    var name = this.currentList[index] + '.jpg'
        // log(this.singJpg.src)
    this.singJpg.src = name
}
playAudioObject.prototype.bindEventToPlayMode = function() {
    // 判断当前的播放模式
    var PlayModeFunction = function() {
        if (this.mode === 'loop') {
            this.modeButton.setAttribute('data-mode', 'random')
            this.modeButton.innerHTML = '<i class="fa fa-random" aria-hidden="true"></i>'
            this.mode = 'random'
            var playList = this.setNextSong(this.mode)
            this.currentList.length = 0
            for (var i = 0; i < playList.length; i++) {
                this.currentList.push(playList[i])
            }
        } else if (this.mode === 'random') {
            this.modeButton.setAttribute('data-mode', 'single')
            this.modeButton.innerHTML = '<i class="fa fa-repeat" aria-hidden="true"></i>'
            this.mode = 'single'
            var playList = this.setNextSong(this.mode)
            this.currentList.length = 0
            for (var i = 0; i < playList.length; i++) {
                this.currentList.push(playList[i])
            }
        } else if (this.mode === 'single') {
            this.modeButton.setAttribute('data-mode', 'loop')
            this.modeButton.innerHTML = '<i class="fa fa-refresh" aria-hidden="true"></i>'
            this.mode = 'loop'
            var playList = this.setNextSong(this.mode)
            this.currentList.length = 0
            for (var i = 0; i < playList.length; i++) {
                this.currentList.push(playList[i])
            }
        }
    }

    var bindFunction = PlayModeFunction.bind(this)
    this.modeButton.addEventListener('click', bindFunction)
}
playAudioObject.prototype.solvePauseAndPlayProblem = function() {
    this.audio.addEventListener('play', (function() {
        // log('play')
        this.controlButton.innerHTML = '<i class="fa fa-pause" aria-hidden="true"></i>'
            // log('this.controlButton.innerHTML', this.controlButton.innerHTML, 'this.controlButton', this.controlButton)
        this.controlButton.className = 'play-control-pause'
            // log('this.controlButton', this.controlButton)
            // log('real', document.querySelector('#play-control-play-or-pause'))
            // var controlButton = document.querySelector('#play-control-play-or-pause')
            // controlButton.outerHTML = `
            // <button id="play-control-play-or-pause" class="play-control-pause" type="button" name="button">pause</button>
            // `
    }).bind(this))
    this.audio.addEventListener('pause', (function() {
        // log('pause')
        this.controlButton.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i>'
        this.controlButton.className = 'play-control-play'
            // log('this.controlButton.innerHTML', this.controlButton.innerHTML, 'this.controlButton', this.controlButton)
            // var controlButton = document.querySelector('#play-control-play-or-pause')
            // controlButton.outerHTML = `
            // <button id="play-control-play-or-pause" class="play-control-play" type="button" name="button">play</button>
            // `
    }).bind(this))
}
playAudioObject.prototype.bindEventToTimeDisplay = function() {
    var canplayFunction = function() {
        var currentDuration = this.audio.duration
        var min = String(Math.floor(currentDuration / 60))
        var sec = String(Math.floor(currentDuration - min * 60))
        if (min.length < 2) {
            min = '0' + min
        }
        if (sec.length < 2) {
            sec = '0' + sec
        }
        var t = `${min}:${sec}`
        this.spanLeft.innerHTML = t
        this.spanRight.innerHTML = `00:00`
            // 还要在载入时设置progressBar
        this.progressBar.value = 0
    }
    var canplayFunctionBind = canplayFunction.bind(this)
    this.audio.addEventListener('canplay', canplayFunctionBind)

    var timeupdateFunction = function() {
        var currentTime = this.audio.currentTime
        var min = String(Math.floor(currentTime / 60))
        var sec = String(Math.floor(currentTime - min * 60))
        if (min.length < 2) {
            min = '0' + min
        }
        if (sec.length < 2) {
            sec = '0' + sec
        }
        var t = `${min}:${sec}`
        this.spanRight.innerHTML = t
    }
    var timeupdateFunctionBind = timeupdateFunction.bind(this)
    this.audio.addEventListener('timeupdate', timeupdateFunctionBind)
}
playAudioObject.prototype.bindEventToProgressBar = function() {

    var timeupdateFunction = function() {

        var currentDuration = this.audio.duration

        var currentTime = this.audio.currentTime
        var setPer = currentTime / currentDuration * 100
        this.progressBar.value = setPer
    }
    var timeupdateFunctionBind = timeupdateFunction.bind(this)
    this.audio.addEventListener('timeupdate', timeupdateFunctionBind)

    // 根据进度条的变化设置播放时间
    var changeFunction = function() {

        // input 可以实时监控， change 滑条失去焦点时响应
        // 获取滑动条滑动到哪里的值
        var value = Number(this.progressBar.value)
            // 设置这个值给播放时间
            // 首先返回当前播放文件的总时长
        var currentDuration = this.audio.duration
        var setTime = value / 100 * currentDuration
        this.audio.currentTime = setTime
    }
    var changeFunctionBind = changeFunction.bind(this)
    this.progressBar.addEventListener('change', changeFunctionBind)

    // 解决change事件和timeupdate事件冲突问题
    this.progressBar.addEventListener('mousedown', (function() {

        this.audio.removeEventListener('timeupdate', timeupdateFunctionBind)
    }).bind(this))

    this.progressBar.addEventListener('mouseup', (function() {

            this.audio.addEventListener('timeupdate', timeupdateFunctionBind)
        }).bind(this))
        // 获取进度条对象
}
playAudioObject.prototype.bindEventToPlayControl = function() {
    // 获取按钮
    this.playControl.addEventListener('click', (function(event) {
        var target = event.target
        var tp = target.parentElement
        // log(target, typeof target)
        // log(target.parentElement, typeof target.parentElement)
        if (target.classList.contains('play-control-prev') || tp.classList.contains('play-control-prev')) {
            // 获取当前的播放器播放的歌曲
            var s = decodeURI(this.source.src)
            var start = s.lastIndexOf('/')
            var src = s.substr(start + 1)
                // 获取当前播放歌曲在播放列表中的位置
            var playList = this.currentList
            var len = playList.length
            for (var i = 0; i < len; i++) {
                if (playList[i] === src) {
                    break;
                }
            }
            // 获取前一首歌的歌名并赋值
            var prevIndex = (i + len - 1) % len
            var prevSong = playList[prevIndex]
            this.source.src = prevSong
            this.audio.src = prevSong
            this.setSingNameAndAuthor(prevIndex)
            this.progressBar.value = 0
        }
        // 播放
        if (target.classList.contains('play-control-play') || tp.classList.contains('play-control-play')) {
            this.audio.play()
                // target.outerHTML = `
                // <button id="play-control-play-or-pause" class="play-control-pause" type="button" name="button">pause</button>
                // `
        }
        // 暂停
        if (target.classList.contains('play-control-pause') || tp.classList.contains('play-control-pause')) {
            this.audio.pause()
                // target.outerHTML = `
                // <button id="play-control-play-or-pause" class="play-control-play" type="button" name="button">play</button>
                // `
        }
        // 下一首
        if (target.classList.contains('play-control-next') || tp.classList.contains('play-control-next')) {
            // 获取当前的播放器播放的歌曲
            var s = decodeURI(this.source.src)
            var start = s.lastIndexOf('/')
            var src = s.substr(start + 1)
                // 获取当前播放歌曲在播放列表中的位置
            var playList = this.currentList
            var len = playList.length
            for (var i = 0; i < len; i++) {
                if (playList[i] === src) {
                    break;
                }
            }
            // 获取前一首歌的歌名并赋值
            var nextIndex = (i + len + 1) % len
            var nextSong = playList[nextIndex]
            this.source.src = nextSong
            this.audio.src = nextSong
            this.setSingNameAndAuthor(nextIndex)
            this.progressBar.value = 0
        }
    }).bind(this), false)
}
playAudioObject.prototype.bindEventToMuteSpan = function() {
    this.muteDiv.addEventListener('click', (function(event) {
        if (event.target === this.muteSpan) {
            if (this.muteSpan.innerHTML === 'volume') {
                this.audio.muted = true
                this.muteSpan.innerHTML = `none`
            } else {
                this.audio.muted = false
                this.muteSpan.innerHTML = `volume`
            }
        }
    }).bind(this))
}
playAudioObject.prototype.bindEventToVolProgressBar = function() {
    var changeVolFunction = function() {
        // input 可以实时监控， change 滑条失去焦点时响应
        // 获取滑动条滑动到哪里的值
        var value = Number(this.volProgressBar.value)
            // 设置这个值给播放时间
            // 首先返回当前播放文件的总时长
        var setVol = value / 100
        this.audio.volume = setVol
    }
    var changeVolFunctionBind = changeVolFunction.bind(this)
    this.volProgressBar.addEventListener('change', changeVolFunctionBind)
}

playAudioObject.prototype.bindEventToPopWindow = function() {
    this.displayListControl.addEventListener('click', function() {
        var popWindow = document.querySelector('.popWindow')
        popWindow.style.visibility = 'visible'
    })
    popWindow = document.querySelector('.popWindow')
    popWindow.addEventListener('click', function() {
        if (popWindow.style.visibility === 'visible') {
            popWindow.style.visibility = 'hidden'
        }
    })
}
playAudioObject.prototype.init = function() {
    this.insertPlayListHTML()
    this.initPlayMode()
    this.initCurrentPlayList()
    this.initAudio()
    this.initPlayStateAndProgressBar()
    this.initVolProgressBar()
        // 事件部分
    this.bindEventToPlayList()
    this.bindEventToSingEnd()
    this.bindEventToPlayMode()
    this.solvePauseAndPlayProblem()
    this.bindEventToTimeDisplay()
    this.bindEventToProgressBar()
    this.bindEventToPlayControl()
    this.bindEventToMuteSpan()
    this.bindEventToVolProgressBar()
    this.bindEventToPopWindow()
}


window.addEventListener('load', function() {
    insertplayer('body') //所有与实际歌曲无关的html代码全部通过该函数插入
    var givenPlayList = [
        "李志 - 米店.mp3",
        "宋冬野 - 安和桥.mp3",
        "宋冬野 - 董小姐.mp3",
        "赵雷 - 成都.mp3",
        "赵雷 - 吉姆餐厅.mp3",
    ]
    var player = new playAudioObject(givenPlayList)
    player.init()
})
