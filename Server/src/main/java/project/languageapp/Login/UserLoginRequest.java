package project.languageapp.Login;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder(toBuilder = true)
public class UserLoginRequest {
    private String username;
    private String password;
}
