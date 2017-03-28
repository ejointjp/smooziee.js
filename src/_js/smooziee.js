(function($){

  $.smooziee = function(options){

    options = $.extend({
      ignore: '.no-scroll', //スクロールを除外するクラス
      offset: -24, //移動先のオフセット
      otherPageScroll: true, //他ページへのリンクの際のスクロール
      scrollKey: 'scroll_id', //ハッシュタグの代わりに使用するクエリのキー
      speed: 1000, //スクロール開始から終了までの時間
      urlParam: 'hash' //URLの書き換え hash, none, scrollKey
    }, options);

    var scrollVal = '', //URLに含まれるスクロールに使われる値
        urlSplit = location.href.split('#'),
        url = urlSplit[0]; //ページURLのハッシュを除いた部分

    //URLにスクロールキーが含まれているか判別
    if(url.indexOf(options.scrollKey) !== -1){
      urlSplit = url.split(options.scrollKey + '=');
      scrollVal = urlSplit[urlSplit.length -1]; //スクロール値を取得
      url = url.substring(0, url.indexOf(options.scrollKey) -1); //スクロールキーと値を削除したURLに変換
    }

    //スクロールを実行する
    var scroll = function(str){
      var hash = toHash(str),
          target = targetConversion(hash);

      //ターゲットが存在する場合スクロールを実行
      if(target.length !== 0){

        var position = target.offset().top + options.offset;

        $('html, body').animate({
          scrollTop: position
        }, options.speed, 'swing');
      }

      var replaceUrl = null;

      if(options.urlParam === 'hash'){
        replaceUrl = url + hash;

      } else if(options.urlParam === 'none'){
        replaceUrl = url;
      }

      //URLを書き換える
      window.history.pushState(null, null, replaceUrl);
    };

    //文字列をハッシュ化
    var toHash = function(str){
      if(str.indexOf('#') === -1){
        str = '#' + str;
      }
      return str;
    };

    //ハッシュ値をもとにターゲットオブジェクトを返す #なら$(html)を返す
    var targetConversion = function(hash){

      if(hash === '#') {
        return $('html');

      } else {
        return $(hash);
      }
    };

    //#を含むhrefを持つaタグ（ignoreクラスを除く）をクリックした時に実行
    $('[href*="#"]:not(' + options.ignore + ')').on('click', function() {

      var $anchor = $(this),
          href = $anchor.attr('href');

      //hrefが#から始まっている場合、通常のページリンク
      if(href.indexOf('#') === 0){
        event.preventDefault();
        scroll(href);

      //hrefが#以外から始まっている場合
      } else {

        var hrefProp = $anchor.prop('href'), //hrefをhttp://...で取得
            hrefPropSplit = hrefProp.split('#'),
            hrefPropName = hrefPropSplit[0], //ハッシュ値を除いたhrefProp
            hrefHash = hrefPropSplit[1]; //hrefのハッシュ値

        //同じサイト内のリンクかどうか判別
        var isInSiteLink = function(){

          //IE10はlocation.originを取得できないので
          if(location.origin === undefined){
            location.origin = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
          }

          //location.originがhrefPropに含まれていればtrue（サイト内リンクである）
          if(hrefPropName.indexOf(location.origin) !== -1){
            return true;

          } else {
            return false;
          }
        };

        //同じページ内のリンクかどうか判別
        var isInPageLink = function(){

          if(hrefPropName === url){
            return true;

          } else {
            return false;
          }
        };

        // URLの '#' を 'scroll_id=' に変換する
        var convertUrl = function(){

          if(href.indexOf('?') !== -1){
            href = href.replace('#', '&' + options.scrollKey + '=');

          } else {
            href = href.replace('#', '?' + options.scrollKey + '=');
          }

          $anchor.attr('href', href);
        };

        //サイト内リンクの場合
        if(isInSiteLink()){

          //ページ内リンクの場合 スクロールさせる
          if(isInPageLink()){
            event.preventDefault();
            scroll(hrefHash);

          //同じサイトの別ページへのリンクの場合
          } else {
            //オプションが有効になっていればURLを変換
            if(options.otherPageScroll){
              convertUrl();

            } else {
              return;
            }
          }

        //他サイトへのリンクの場合何もしない
        } else {
          return;
        }
      }
    });

    //URLにスクロールのターゲットが指定されていればスクロール
    if(options.otherPageScroll && scrollVal !== ''){
      scroll(scrollVal);
    }

    return this;
  };
})(jQuery);
