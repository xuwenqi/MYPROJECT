var viewData = { videoIndex: -1 };
var args = mQuery.parse(location.search);
var $video = $('.video-opt');
var video = $video[0];
var clickE = 1,
    isPlay = 0;
var progress = null;
var num = 0;
var controlBar = null;
var s = null;

function animate(val, index) {
    if (val < 0) {
        num = 0;
    } else if (val > 100) {
        num = 100;
    } else {
        num = val
    }
    controlBar.eq(index).reach(num);
}

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i) ? true : false;
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i) ? true : false;
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
    },
    Tencent: function() {
        return navigator.userAgent.match(/MicroMessenger/i) ? true : false;
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) ? true : false;
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
    }
};

function downApp() {
    if (isMobile.Android()) {
        $('.header-donwload').addClass('android');
        $('.attention').attr('href', 'http://www.immomo.com/download/momo_apk/?&amp;b=android_downapk_footer');
    } else if (isMobile.iOS()) {
        $('.header-donwload').addClass('ios');
        $('.attention').attr('href', 'http://www.immomo.com/download/ios/?&amp;b=ios_downappstore_footer');
    }
}
video.controls = false;

var tool = {
    initEvent: function() {
        var _this = this;
        controlBar = $('#sample-pb .number-pb').NumberProgressBar({
            duration: 9,
            current: num
        });

        // debug 在微信手机反转底部footer缩小bug（移动或pc浏览器没问题） 
        window.addEventListener("orientationchange", function() {
            if (document.documentElement.scrollTop) {
                document.documentElement.scrollTop = 10;
            } else {
                document.body.scrollTop = 10;
            }
        }, false);

        $('.bg-video').on('click', function() {
            if (clickE) {
                $video.show();
                clickE = 0;
                // debbug ios7 要按播放两次的bug
                try {
                    video.currentTime = 0;
                    video.play();
                } catch (err) {
                    $video.trigger('play');
                }
            }

        });
        $video.on('playing', function() {
            console.log('video event trigger playing !');

            if (viewData.videoIndex == 0) {
                video.autoplay = false;
            }

            var dTime = video.duration * 1;
            var canCount = true;
            if (viewData.videoIndex >= viewData.videoList.length) {
                video.loop = false;
                canCount = false;
            }
            if (video.currentTime == 0) {
                countDown(dTime, canCount, viewData.videoIndex);
            }
        });
        $video.on('canplaythrough', function() {
            console.log('video event trigger canplaythrough !');

        });
        // debug  解决安卓暂停video元素脱离流影响底部fixed定位

        $video.on('pause', function() {
            if (isMobile.Android()) {
                $('.bg-video').hide();
                $(this).css({ 'height': '86%' });
            }
        });
        $video.on('play', function() {
            $video.css({ 'height': '100%' });
            clickE = 0;
            isPlay = 1;
            console.log('video event trigger play');
        });
        $video.on('ended', function() {
            console.log('video play over');
            clearInterval(s);
            animate(100, viewData.videoIndex);

            if (viewData.videoIndex >= viewData.videoList.length - 1) {
                if (isMobile.Android()) {
                    controlBar.reach(100);
                    $video.hide();
                }
                $('.share-info').hide();
                $('#tip-win').css('display', 'block');
                setTimeout(function() {
                    $('#tip-win').css('display', 'block');
                    $('.tip-content').addClass('active');

                }, 20);

                video.loop = false;
                return;

            }
            viewData.videoIndex++;
            _this.initVueModel(viewData);
            setTimeout(function() {
                video.play();
            }, 40)

        });
    },
    isMale: function(str) {
        if (str == 'F') {
            $('.icon-tag').addClass('icon-girl');
        } else if (str == 'M') {
            $('.icon-tag').addClass('icon-boy');
        }
    },
    parseViewModel: function(resp) {
        var body = {};
        // if(resp.state){
        //     body.state = resp.state;
        // }
        if (resp.data.list && resp.data.list.length > 0) {
            body.videoList = resp.data.list;
            body.videoIndex = 0;
        } else {
            body.videoList = [];
            body.videoIndex = -1;
        }
        return body;
    },
    initVueModel: function(curObj) {
        if (curObj.videoIndex != -1) {
            console.log(this)
            console.log(curObj)
            var obj = '<div></div>';
            var curName = $(obj).html(curObj.videoList[curObj.videoIndex].user.name).text();
            var userInfo = curObj.videoList[curObj.videoIndex].user;
            $('.avatar').attr('src', curObj.videoList[curObj.videoIndex].user.img);
            $('.info .name').text(userInfo.name);
            $('.info .time').text(userInfo.sign);
            $('.info .user-age').text(userInfo.age);
            this.isMale(userInfo.sex);
            $('.id-container .momo-id').text(userInfo.momoid)
            $('.video-opt').attr('src', curObj.videoList[curObj.videoIndex].video.video_url);
            $('.video-opt').attr('poster', curObj.videoList[curObj.videoIndex].video.cover.l);
            $('.bg-video img').attr('src', curObj.videoList[curObj.videoIndex].video.cover.l);
        }
        if (curObj.videoIndex == 0) {
            var $progress = $('#sample-pb');
            var html = '';
            for (var i = 0; i <= curObj.videoList.length - 1; i++) {
                html += '<div class="progress-item"><div class="number-pb">' +
                    '<div class="number-pb-shown"></div>' +
                    '</div></div>';
            }
            $progress.append(html);
            $('.progress-item').css('width', 100 / curObj.videoList.length + '%');
            $('#share-pic').attr('src', curObj.videoList[0].video.video_url);
        }

    },
    getRecomList: function() {
        var self = this;
        var url = '/inc/microvideo/share/recommends';
        $.ajax({
            useCache: 1,
            url: url,
            type: 'GET',
            data: {
                page_rows: 9
            },
            dataType: 'json',
            success: function(res) {
                if (res.ec == 200) {
                    var html = '',
                        arr = res.data.list;
                    for (var i = 0; i < arr.length; i++) {
                        var obj = mQuery.parse(location.search);
                        var jumpHref;
                        if (obj) {
                            obj.momentids = arr[i].feedid;
                            jumpHref = 'share-weixin.html?' +
                                mQuery.serialize(obj).substring(1);
                        }
                        html += '<li class="recom-item"><a href="' +
                            jumpHref + '"><div class="img-contain"><img src="' +
                            arr[i].cover.l + '" alt=""></div></a></li>';
                    }
                    $('.recom-list').append(html);
                }
            }
        })
    },
    getPersonInfo: function() {
        var _this = this;
        var url = '/inc/microvideo/share/profiles';
        $.ajax({
            useCache: 1,
            url: url,
            type: 'POST',
            dataType: 'json',
            data: { feedids: args.momentids || '' },
            success: function(body) {
                "use strict";
                // var objTitle = '<div></div>';
                // var curTitle = $(objTitle).html(body.state.title).text();
                // document.setTitle(curTitle);
                // $('#code-text').text(body.state.text);
                if (body.ec == 200) {
                    viewData = _this.parseViewModel(body);
                    _this.initVueModel(viewData);
                    _this.initEvent();
                } else {
                    $('#sample-pb').hide();
                    if (body.ec == 406) {} else if (body.ec == 407) { //时刻过期
                        var curString = '的这个时刻已经过期消失';
                        var obj = '<div></div>';
                        var curName = $(obj).html(body.em).text();

                        $('#userName').text(curName);
                        $('#share-item-two').text(curString);
                        setTimeout(function() {
                            $('#tip-win').css('display', 'block');
                            $('.tip-content').addClass('active');

                        }, 10);
                    } else if (body.ec == 408) {
                        var curString = '的这个时刻已经删除';

                        var obj = '<div></div>';
                        var curName = $(obj).html(body.em).text();

                        $('#userName').text(curName);
                        $('#share-item-two').text(curString);
                        setTimeout(function() {
                            $('#tip-win').css('display', 'block');
                            $('.tip-content').addClass('active');

                        }, 10);
                    }
                }
            },
            finish: function(body) {
                "use strict";
            },
            error: function() {

            }
        });
    },

}


tool.getPersonInfo();
tool.getRecomList();
downApp();
/**
 *  video倒计时
 */
function countDown(duration, canPlay, index) {
    if (!canPlay) {
        return
    }
    var start = duration;
    s = setInterval(function() {
        var curTime = video.currentTime;
        if (start > duration - curTime * 1) {
            animate(curTime / duration * 100, index);
            start = duration - curTime * 1;
            console.log(curTime / duration * 100);
        }
        if (start <= 0) {
            clearInterval(s);
            animate(100, index);
        }
    }, 20)
}

/**
 *  设置站外title
 */
document.setTitle = function(t) {
    document.title = t;
    var i = document.createElement('iframe');
    i.src = '//m.baidu.com/favicon.ico';
    i.style.display = 'none';
    i.onload = function() {
        setTimeout(function() {
            i.remove();
        }, 9)
    }
    document.body.appendChild(i);
}