package ru.kata.spring.boot_security.demo.dao;

import ru.kata.spring.boot_security.demo.model.Role;

import java.util.List;

public interface RoleDao {
    Role findByName(String name);

    void save(Role role);

    List<Role> getAllRoles();
}
