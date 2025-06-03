package ru.kata.spring.boot_security.demo.configs;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import ru.kata.spring.boot_security.demo.dao.RoleDao;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.util.List;


@Component
public class DataInitializer implements CommandLineRunner {

    private final UserService userService;
    private final RoleDao roleDao;

    public DataInitializer(UserService userService, RoleDao roleDao) {
        this.userService = userService;
        this.roleDao = roleDao;
    }

    @Override
    public void run(String... args) throws Exception {
        if (roleDao.findByName("ROLE_ADMIN") == null) {
            Role adminRole = new Role("ROLE_ADMIN");
            roleDao.save(adminRole);
        }
        if (roleDao.findByName("ROLE_USER") == null) {
            Role userRole = new Role("ROLE_USER");
            roleDao.save(userRole);
        }

//        User admin = new User();
//        admin.setFirstName("Admin");
//        admin.setLastName("User");
//        admin.setEmail("admin@example.com");
//        admin.setPassword("admin");
//        userService.saveUserWithRoles(admin, List.of("ROLE_ADMIN"));
//
//        User user = new User();
//        user.setFirstName("User");
//        user.setLastName("Simple");
//        user.setEmail("user@example.com");
//        user.setPassword("user");
//        userService.saveUserWithRoles(user, List.of("ROLE_USER"));
    }
}