package com.tourism.controller;


import com.tourism.dto.Menu;
import com.tourism.dto.User;
import com.tourism.service.AuthenticationService;
import com.tourism.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Created by yfyuan on 2016/7/25.
 */
@RestController
@RequestMapping("/commons")
public class CommonsController {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private MenuService menuService;

//    @Autowired
//    private AdminSerivce adminSerivce;

    @RequestMapping(value = "/getUserDetail")
    public User getUserDetail() {
        return authenticationService.getCurrentUser();
    }

    @RequestMapping(value = "/getMenuList")
    public List<Menu> getMenuList() {
        return menuService.getMenuList();
    }

//    @RequestMapping(value = "/changePwd")
//    public ServiceStatus changePwd(@RequestParam(name = "curPwd") String curPwd, @RequestParam(name = "newPwd") String newPwd, @RequestParam(name = "cfmPwd") String cfmPwd) {
//        return adminSerivce.changePwd(authenticationService.getCurrentUser().getUserId(), curPwd, newPwd, cfmPwd);
//    }
}
