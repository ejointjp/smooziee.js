//preタグをインデント可能にする｡またpreタグの最後の行が空かないようにする
$(function(){

  $pres = $('pre');

  $pres.each(function(){
    html = $(this).html();
    if ($(this).has('code').length > 0) {
      html = $(this).children('code').html();
    } else {
      html = $(this).html();
    }

    lineArray = html.split(/\r\n|\r|\n/);
    firstLine = lineArray[0];
    indent = firstLine.match('^ +');
    trimLineArray = [];

    $.each(lineArray, function(i){
      line = this.replace(indent, '');
      if (i == lineArray.length -1 && line.match(/^[ 　\r\n\t]*$/)){
        $.noop;
      } else {
        trimLineArray.push(line);
      }
    });

    returnHtml = trimLineArray.join('\n');
    $(this).html(returnHtml);
  });
});
