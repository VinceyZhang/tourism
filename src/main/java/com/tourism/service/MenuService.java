package com.tourism.service;

import com.tourism.dto.Menu;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by yfyuan on 2016/12/21.
 */
@Repository
public class MenuService {

    private static List<Menu> menuList = new ArrayList<>();

    static {
        menuList.add(new Menu(1, -1, "SIDEBAR.CONFIG", "config"));
        menuList.add(new Menu(2, 1, "SIDEBAR.DATA_SOURCE", "config.datasource"));
        menuList.add(new Menu(3, 1, "SIDEBAR.CUBE", "config.dataset"));
        menuList.add(new Menu(4, 13, "SIDEBAR.WIDGET", "config.widget"));
        menuList.add(new Menu(5, 13, "SIDEBAR.DASHBOARD", "config.board"));
        menuList.add(new Menu(6, 1, "SIDEBAR.DASHBOARD_CATEGORY", "config.category"));
        menuList.add(new Menu(7, -1, "SIDEBAR.ADMIN", "admin"));
        menuList.add(new Menu(8, 7, "SIDEBAR.USER_ADMIN", "admin.user"));
        menuList.add(new Menu(10, 12, "SIDEBAR.DATA_MANAGER_WIDGET", "config.dataManagerWidget"));
        menuList.add(new Menu(11, 12, "SIDEBAR.DATA_MANAGER_BOARD", "config.dataManagerBoard"));
        menuList.add(new Menu(12, 1, "SIDEBAR.DATA_MANAGER_DIR", "config.data_manager_dir"));
        menuList.add(new Menu(13, 1, "SIDEBAR.DATA_VIEW", "config.data_view"));
        menuList.add(new Menu(14, 1, "SIDEBAR.OFF_LINE_ANALYSIS", "config.offLineAnalysis"));
    }

    public List<Menu> getMenuList() {
        return menuList;
    }

}
