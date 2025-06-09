package ru.kata.spring.boot_security.demo.service;

import org.springframework.security.core.userdetails.UserDetailsService;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;

import java.util.List;
import java.util.Set;

public interface UserService extends UserDetailsService {
    List<User> getAllUsers();

    void saveUserWithRoles(User user, List<String> roleNames);

    void deleteUser(Long id);

    void updateUserWithRoles(User user, List<String> roleNames);

    User showUser(Long id);

    User findByEmail(String email);

    List<Role> getAllRoles();

    Set<Role> resolveRoles(List<String> roleNames);
}
