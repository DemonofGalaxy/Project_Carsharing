package demonofgalaxy.project_carsharing.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    public AppUserDetails requireUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AppUserDetails details)) {
            throw new AccessDeniedException("Пользователь не аутентифицирован");
        }
        return details;
    }

    public Long resolveUserId(Long requestedUserId) {
        AppUserDetails current = requireUser();
        if (requestedUserId == null || requestedUserId.equals(current.getId())) {
            return current.getId();
        }
        boolean admin = current.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
        if (!admin) {
            throw new AccessDeniedException("Нельзя выполнять действие от имени другого пользователя");
        }
        return requestedUserId;
    }
}
