package project.languageapp.Language.Model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class EntityWithIcon {

    private String pictureURL = "";

    public abstract String getEntityID();
}
