package com.tourism.dao;

import com.tourism.pojo.DashboardUser;
import com.tourism.pojo.DashboardUserRole;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface UserDao {
    int save(DashboardUser user);

    List<DashboardUser> getUserList();

    int update(DashboardUser user);

    int saveUserRole(List<DashboardUserRole> list);

    int deleteUserRole(Map<String, Object> param);

    List<DashboardUserRole> getUserRoleList();

    DashboardUser getUserByLoginName(String loginName);

    int saveNewUser(String userId, String user_name, String loginName);

    int updateUserPassword(String userId, String passowrd, String newPassword);

    int deleteUserRoleByRoleId(String roleId);
}
