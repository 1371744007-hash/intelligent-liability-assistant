const cases = [
  {id:'C001',name:'R001 去程已损坏',orderId:'O1001',text:'用户签收当天在客服视频中已展示瓶口缺角，原样退回；本次报案也是同一处瓶口缺角。客服记录可核对。',expected:{responsibility:'商家责',compensate:'否',recover:'否',rules:['R001']},reason:'证据如能确认去程同一损坏，适用 R001',textOnly:true},
  {id:'C002',name:'R002 相似自有商品',orderId:'O1002',text:'开箱全程视频及不可复制序列标签记录显示，退回的是用户自有白色羊毛衫而非售出商品；该差异不属于揽收验货项目可识别范围。',expected:{responsibility:'用户责',compensate:'是',recover:'否',rules:['R002']},reason:'身份差异及验货能力边界均有证据支持',textOnly:true},
  {id:'C003',name:'R003 使用痕迹且覆盖',orderId:'O1003',text:'退回手表塑封被拆且表盘有使用划痕，系统验货记录也确认这两项异常。',expected:{responsibility:'用户责',compensate:'是',recover:'是',rules:['R003']},reason:'使用痕迹获支持且验货项目覆盖',textOnly:true},
  {id:'C004',name:'R004 运输挤压破损',orderId:'O1006',text:'退件外箱严重挤压并有贯穿破口，箱内玻璃餐盘在对应位置碎裂；无其他具体原因证据。',expected:{responsibility:'物流责',compensate:'是',recover:'是',rules:['R004']},reason:'内外同时破损且无其他原因',textOnly:true},
  {id:'C005',name:'R005 物流错件',orderId:'O1007',text:'物流站点交接扫描和监控记录确认，两票退件由工作人员贴反面单，商家收到另一票商品。',expected:{responsibility:'物流责',compensate:'是',recover:'是',rules:['R005']},reason:'物流操作错件有明确记录',textOnly:true},
  {id:'C006',name:'R006 天灾损坏',orderId:'O1006',text:'物流事故证明显示运输车辆遭突发洪水淹没，该退件在涉事车辆清单中，餐具因浸水和碰撞损坏。',expected:{responsibility:'保险责',compensate:'是',recover:'否',rules:['R006']},reason:'运输中天灾有证据支持',textOnly:true},
  {id:'C007',name:'R007 高仿确认',orderId:'O1007',text:'品牌官方鉴定报告与订单序列号链路确认，退回商品为高仿假货。',expected:{responsibility:'保险责',compensate:'是',recover:'否',rules:['R007']},reason:'权威鉴定及身份链路材料充分',textOnly:true},
  {id:'C008',name:'R008 外好内损',orderId:'O1008',text:'六面外箱连续开箱视频确认无挤压破损，开箱后手办内部支架断裂；无其他明确原因。',expected:{responsibility:'保险责',compensate:'是',recover:'否',rules:['R008']},reason:'外包装完好获得确认而内物破损',textOnly:true},
  {id:'B001',name:'边界：无外包装证据',orderId:'O1001',text:'退回后发现花瓶破损，没有拍摄外包装。',expected:{responsibility:'待人工判定',compensate:'待确认',recover:'待确认',rules:[]},reason:'缺少包装及损坏时间证据',textOnly:true},
  {id:'B002',name:'边界：验货不含划痕',orderId:'O1004',text:'证据支持耳机被用户使用后出现新增划痕。',expected:{responsibility:'用户责',compensate:'是',recover:'否',rules:['R003']},reason:'责任可定，但验货项目不覆盖划痕',textOnly:true},
  {id:'B003',name:'边界：验货记录缺失',orderId:'O1005',text:'连续开箱视频支持镜头被用户使用并出现新增污渍。',expected:{responsibility:'用户责',compensate:'是',recover:'待确认',rules:['R003']},reason:'责任可定，验货信息未知导致追偿待确认',textOnly:true},
  {id:'B004',name:'边界：损坏时间不明',orderId:'O1001',text:'用户说签收时就有裂纹，商家说退货运输中才裂，双方材料无法确认。',expected:{responsibility:'待人工判定',compensate:'待确认',recover:'待确认',rules:[]},reason:'去程与退程损坏无法区分',textOnly:true},
  {id:'B005',name:'边界：调包或错件不明',orderId:'O1007',text:'商家收到的不是售出鞋款，但没有退货交接链路或用户侧记录。',expected:{responsibility:'待人工判定',compensate:'待确认',recover:'待确认',rules:[]},reason:'用户退错与物流错件均可能',textOnly:true},
  {id:'B006',name:'边界：怀疑高仿',orderId:'O1007',text:'商家看照片感觉做工不对，怀疑是高仿，没有鉴定报告。',expected:{responsibility:'待人工判定',compensate:'待确认',recover:'待确认',rules:[]},reason:'单方怀疑不足以确认高仿',textOnly:true},
  {id:'B007',name:'边界：材料矛盾',orderId:'O1003',text:'商家称退回时塑封完整，但系统验货记录为塑封已拆。',expected:{responsibility:'待人工判定',compensate:'待确认',recover:'待确认',rules:['R003']},reason:'文案与验货记录矛盾，按规则转人工',textOnly:true}
];
module.exports = { cases };
