var Remarkable = require('./remarkable');
var parser = new Remarkable({
	html: true
});

var flagHeight = '60rpx;';
var flagArr = [
	'travis-ci.org',
	'img.shields.io',
	'img.badgesize.io',
	'badges.gitter.im'
];
var sysInfo = wx.getSystemInfoSync();

function parse(md, page, options){

	if(!options) options = {};
	if(!options.name) options.name = 'wemark';
	if(!options.imageWidth) {
		// 先写一个默认值
		options.imageWidth = sysInfo.windowWidth;
	}

	var tokens = parser.parse(md, {});

	// markdwon渲染列表
	var renderList = [];
	// 图片高度数组
	var imageWidth = {};
	var imageStatus = {};
	// 图片列表
	var images = [];
	// 返回的数据
	var ret = Object.assign({
		renderList: renderList,
		imageWidth: imageWidth,
		imageStatus: imageStatus,
		images: images,
	}, options.ext || {});

	var env = [];
	// 记录当前list深度
	var listLevel = 0;
	// 记录第N级ol的顺序
	var orderNum = [0, 0];
	var tmp;

	// 获取inline内容
	var getInlineContent = function(inlineToken){
		var retInline = [];
		var env;

		if(inlineToken.type === 'htmlblock'){
			// 匹配video
			// 兼容video[src]和video > source[src]
			var videoRegExp = /<video.*?src\s*=\s*['"]*([^\s^'^"]+).*?(?:\/\s*\>|<\/video\>)/g;

			var match;
			var html = inlineToken.content.replace(/\n/g, '');
			while(match = videoRegExp.exec(html)){
				if(match[1]){
					retInline.push({
						type: 'video',
						src: match[1]
					});
				}
			}
		}else{
			inlineToken.children.forEach(function(token, index){
				if(['text', 'code'].indexOf(token.type) > -1){
					retInline.push({
						type: env || token.type,
						content: token.content
					});
					env = '';
			}else if(token.type === 'del_open'){
				env = 'deleted';
				}else if(token.type === 'strong_open'){
					env = 'strong';
				}else if(token.type === 'em_open'){
					env = 'em';
				}else if(token.type === 'image'){
					// console.log(token);
					const json = {
						type: token.type,
						src: token.src,
					}
					for (var i = 0; i < flagArr.length; i++) {
						if (token.src.match(new RegExp(`${flagArr[i]}.+\.svg`, 'gi'))) {
							json.subtype = 'icon';
							break;
						}
					}
					if (json.subtype !== 'icon') {
						ret.images.push(token.src);
					}
					retInline.push(json);
				}
			});
		}

		return retInline;
	};

	var getBlockContent = function(blockToken, index){
		if(blockToken.type === 'htmlblock'){
			return getInlineContent(blockToken);
		}else if(blockToken.type === 'heading_open'){
			return {
				type: 'h' + blockToken.hLevel,
				content: getInlineContent(tokens[index+1])
			};
		}else if(blockToken.type === 'paragraph_open'){
			var type = 'p';
			var prefix = '';
			if(env.length){
				prefix = env.join('_') + '_';
			}

			var content = getInlineContent(tokens[index+1]);

			// 处理ol前的数字
			if(env[env.length - 1] === 'li' && env[env.length - 2] === 'ol'){
				content.unshift({
					type:'text',
					content:orderNum[listLevel - 1] + '. '
				});
			}

			return {
				type: prefix + 'p',
				content: content
			};
		}else if(blockToken.type === 'fence'){
			return {
				type: 'code',
				content: blockToken.content
			};
		}else if(blockToken.type === 'bullet_list_open'){
			env.push('ul');
			listLevel++;
		}else if(blockToken.type === 'ordered_list_open'){
			env.push('ol');
			listLevel++;
		}else if(blockToken.type === 'list_item_open'){
			env.push('li');
			if(env[env.length - 2] === 'ol' ){
				orderNum[listLevel - 1]++;
			}
		}else if(blockToken.type === 'list_item_close'){
			env.pop();
		}else if(blockToken.type === 'bullet_list_close'){
			env.pop();
			listLevel--;
		}else if(blockToken.type === 'ordered_list_close'){
			env.pop();
			listLevel--;
			orderNum[listLevel] = 0;
		}else if(blockToken.type === 'blockquote_open'){
			env.push('blockquote');
		}else if(blockToken.type === 'blockquote_close'){
			env.pop();
		}else if(blockToken.type === 'tr_open'){
			tmp = {
				type: 'table_tr',
				content:[]
			};
			return tmp;
		}else if(blockToken.type === 'th_open'){
			tmp.content.push({
				type: 'table_th',
				content: getInlineContent(tokens[index+1]).map(function(inline){return inline.content;}).join('')
			});
		}else if(blockToken.type === 'td_open'){
			tmp.content.push({
				type: 'table_td',
				content: getInlineContent(tokens[index+1]).map(function(inline){return inline.content;}).join('')
			});
		}
	};

	tokens.forEach(function(token, index){
		var blockContent = getBlockContent(token, index);
		if(Array.isArray(blockContent)){
			blockContent.forEach(function(block){
				renderList.push(block);
			});
		}else if(blockContent){
			renderList.push(blockContent);
		}
	});

	// 为page实例添加fixHeight方法
	page.wemarkFixImageHeight = function (e){
		var natureHeight = e.detail.height;
		var natureWidth = e.detail.width;
		var asp = natureHeight/natureWidth;
		var obj = {};
		var name = options.name;
		// 异步加载导致更新不到对应数组元素的值，采用外部传参
		if (e.target.dataset.wemarkindex >= 0) {
			name = name.replace('{{wemarkIndex}}', e.target.dataset.wemarkindex);
		}
		if (sysInfo.windowWidth > natureWidth) {
			obj[name + '.imageStatus.' + e.target.dataset.id] = {
				width: natureWidth,
				height: natureHeight,
				loaded: 'loaded',
			};
		} else {
			obj[name + '.imageStatus.' + e.target.dataset.id] = {
				height: options.imageWidth*asp,
				loaded: 'loaded',
			};
		}
		console.log(obj, e)
		this.setData(obj);
	};

	// 添加图片点击事件, 杂乱的数据，后期重构markdown插件
	page.wemarkImageTap = function (e) {
		var name = options.name;
		if (e.target.dataset.wemarkindex) {
			name = name.replace('{{wemarkIndex}}', e.target.dataset.wemarkindex);
		}
		var param1 = name.split('[');
		if (ret.preview && param1 && param1[0]) {
			param1 = param1[0];
			var data = this.data[param1];
			if (data && e.target.dataset.wemarkindex >= 0) {
				data = data[e.target.dataset.wemarkindex];
				data = data.bodyParse || {};
				data = data.images || [];
				if (data.length > 0) {
					wx.previewImage({
					  current: data[0], // 当前显示图片的http链接
					  urls: data // 需要预览的图片http链接列表
					})
				}
			}
		}
	};

	var obj = {};
	var name = options.name;
	// 兼容外部数组格式的markdown
	if (ret.wemarkIndex || ret.wemarkIndex >= 0) {
		name = name.replace('{{wemarkIndex}}', ret.wemarkIndex);
	}
	obj[name] = ret;
	page.setData(obj);
}

module.exports = {
	parse: parse
};
