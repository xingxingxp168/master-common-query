/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80020
 Source Host           : localhost:3306
 Source Schema         : platform

 Target Server Type    : MySQL
 Target Server Version : 80020
 File Encoding         : 65001

 Date: 04/04/2022 10:52:50
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for common_query
-- ----------------------------
DROP TABLE IF EXISTS `common_query`;
CREATE TABLE `common_query` (
  `series` int NOT NULL AUTO_INCREMENT COMMENT '流水号',
  `tenant_num_id` smallint DEFAULT '1' COMMENT '租户',
  `data_sign` smallint DEFAULT '0' COMMENT '数据类型，0为正式数据，1为测试数据',
  `sql_id` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'SQL语句的唯一标识',
  `sql_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'SQL语句的中文描述',
  `sql_content` varchar(255) DEFAULT NULL COMMENT 'SQL语句',
  `sql_params` varchar(255) DEFAULT NULL COMMENT 'SQL参数',
  `sub_sql_id` varchar(255) DEFAULT NULL COMMENT '子查询SQL_ID',
  `jdbc_name` varchar(50) DEFAULT NULL COMMENT '数据源名称',
  `cancel_sign` varchar(2) DEFAULT NULL COMMENT '逻辑删除数据标识,Y表示已经删除',
  `create_dtme` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
  `create_user` smallint DEFAULT NULL COMMENT '创建人',
  `update_dtme` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `last_update_user` smallint DEFAULT NULL COMMENT '最后更新人',
  PRIMARY KEY (`series`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of common_query
-- ----------------------------
BEGIN;
INSERT INTO `common_query` VALUES (1, 1, 0, 'get_category', '查询分类', 'select * from t_category where cancel_sign=\'N\' \nand category_name like ?\norder by series desc', '[\n	{\"name\": \"name\",\"musthave\": true,\"qtype\":\"like\"}\n]', 'get_create_user,get_update_user', 'nodeDataSource', 'N', '2022-04-02 21:19:06', 1, '2022-04-02 21:19:06', 1);
INSERT INTO `common_query` VALUES (2, 1, 0, 'get_create_user', '查询新建人员名称子查询', 'select create_name from (\nselect name as create_name from t_user where cancel_sign=\'N\'\nand id = ?\nunion \nselect \'\') A limit 1', '[\n	{\"name\": \"create_user\",\"musthave\": true}\n]', NULL, 'mdmDataSource', 'N', '2022-04-02 21:19:20', 1, '2022-04-02 21:19:20', 1);
INSERT INTO `common_query` VALUES (3, 1, 0, 'get_update_user', '查询最后更新人员名称子查询', 'select update_name from (\nselect name as update_name from t_user where cancel_sign=\'N\'\nand id = ?\nunion \nselect \'\') A limit 1', '[\n	{\"name\": \"last_update_user\",\"musthave\": true}\n]', NULL, 'mdmDataSource', 'N', '2022-04-02 21:19:36', 1, '2022-04-02 21:19:36', 1);
INSERT INTO `common_query` VALUES (4, 1, 0, 'get_common_query', '查询通用查询', 'select * from common_query where cancel_sign=\'N\' \n[ and sql_id like ? ]\n[ and category_name like ? ]\norder by series desc', '[\n	{\"name\": \"sql_id\",\"musthave\": false,\"qtype\":\"like\"},\n	{\"name\": \"sql_name\",\"musthave\": false,\"qtype\":\"like\"}\n]', NULL, 'platformDataSource', 'N', '2022-04-02 21:19:59', 1, '2022-04-02 21:19:59', 1);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
