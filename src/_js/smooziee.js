/*!
 * smooziee.js v0.2.1
 *
 * Copyright 2017 e-JOINT.jp
 * https://ejointjp.github.io/smooziee.js
 * MIT license
 */

(function (factory) {
 if (typeof module === "object" && typeof module.exports === "object") {
   module.exports = factory(require("jquery"), window, document);
 } else {
   factory(jQuery, window, document);
 }
}(function($, window, document, undefined){

  'use srtict';

  $.smooziee = function(options){

    options = $.extend({
      ignore: '.no-scroll', // Ignore a tag of this class
      offset: -24, // Scroll target point offset
      otherPageScroll: true, // Scroll through links to other pages
      scrollKey: 'scroll_id', // The key used for scrolling
      speed: 1000, // Scroll speed
      urlHistory: 'replace', // replace or push
      urlParam: 'hash' // hash or none or default
    }, options);

    var scrollVal = '';
    var urlSplit = location.href.split('#');
    var url = urlSplit[0];

    // URLにスクロールキーが含まれているか判別
    if(url.indexOf(options.scrollKey) !== -1){
      urlSplit = url.split(options.scrollKey + '=');
      scrollVal = urlSplit[urlSplit.length -1]; // スクロール値を取得
      url = url.substring(0, url.indexOf(options.scrollKey) -1); // スクロールキーと値を削除したURLに変換
    }

    // スクロールを実行する
    var scroll = function(str){

      var hash = toHash(str);
      var target = targetConversion(hash);

      // ターゲットが存在する場合スクロールを実行
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

      // URLを書き換える
      if(replaceUrl !== null){
        if(options.urlHistory === 'push'){
          window.history.pushState(null, null, replaceUrl);

        } else {
          window.history.replaceState(null, null, replaceUrl);
        }
      }
    };

    // 文字列をハッシュ化
    var toHash = function(str){
      if(str.indexOf('#') === -1){
        str = '#' + str;
      }
      return str;
    };

    // ハッシュ値をもとにターゲットオブジェクトを返す #なら$(html)を返す
    var targetConversion = function(hash){
      if(hash === '#') {
        return $('html');
      } else {
        return $(hash);
      }
    };

    // #を含むhrefを持つaタグ（ignoreクラスを除く）をクリックした時に実行
    $('[href*="#"]:not(' + options.ignore + ')').on('click', function() {

      var $anchor = $(this);
      var href = $anchor.attr('href');

      // hrefが#から始まっている場合、通常のページリンク
      if(href.indexOf('#') === 0){
        event.preventDefault();
        scroll(href);

      // hrefが#以外から始まっている場合
      } else {

        var hrefProp = $anchor.prop('href'); // hrefをhttp://...で取得
        var hrefPropSplit = hrefProp.split('#');
        var hrefPropName = hrefPropSplit[0]; // ハッシュ値を除いたhrefProp
        var hrefHash = hrefPropSplit[1]; // hrefのハッシュ値

        // 同じサイト内のリンクかどうか判別
        var isInSiteLink = function(){

          // IE10はlocation.originを取得できないので
          if(location.origin === undefined){
            location.origin = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
          }

          // location.originがhrefPropに含まれていればtrue（サイト内リンクである）
          if(hrefPropName.indexOf(location.origin) !== -1){
            return true;

          } else {
            return false;
          }
        };

        // 同じページ内のリンクかどうか判別
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

        // サイト内リンクの場合
        if(isInSiteLink()){
          // ページ内リンクの場合スクロール
          if(isInPageLink()){
            event.preventDefault();
            scroll(hrefHash);
          // 同じサイトの別ページへのリンクの場合
          } else {
            // オプションが有効になっていればURLを変換
            if(options.otherPageScroll){
              convertUrl();
            } else {
              return;
            }
          }
        } else {
          return;
        }
      }
    });

    // オプション値が有効 かつURLに scroll__id=xxx があればスクロール
    if(options.otherPageScroll && scrollVal !== ''){
      scroll(scrollVal);
    }

    return this;
  };
}));
