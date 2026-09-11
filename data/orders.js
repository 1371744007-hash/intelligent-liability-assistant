const orders = [
  { id:'O1001', product:'陶瓷花瓶', inspectionService:'有', inspectionItems:['外包装完整性','商品破损'], inspectionResult:'退件揽收时外包装及商品外观无明显异常' },
  { id:'O1002', product:'白色羊毛衫', inspectionService:'有', inspectionItems:['品类与颜色'], inspectionResult:'记录为白色上衣，无法核验唯一身份标识' },
  { id:'O1003', product:'智能手表', inspectionService:'有', inspectionItems:['塑封','划痕'], inspectionResult:'塑封已拆，表盘有明显划痕' },
  { id:'O1004', product:'蓝牙耳机', inspectionService:'有', inspectionItems:['塑封'], inspectionResult:'塑封完好；未检查划痕' },
  { id:'O1005', product:'相机镜头', inspectionService:'未知', inspectionItems:'未知', inspectionResult:'未知' },
  { id:'O1006', product:'玻璃餐具套装', inspectionService:'无', inspectionItems:[], inspectionResult:'无验货记录' },
  { id:'O1007', product:'限量运动鞋', inspectionService:'有', inspectionItems:['商品型号','鞋盒'], inspectionResult:'型号与订单一致' },
  { id:'O1008', product:'收藏手办', inspectionService:'有', inspectionItems:['外包装完整性'], inspectionResult:'外包装无明显挤压，未拆箱检查内物' }
];
module.exports = { orders };

