import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.internal.util.reflection.FieldSetter;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.HttpEntity;
import project.languageapp.Language.RestController.ResourceController;

import static junit.framework.TestCase.assertTrue;

@RunWith(MockitoJUnitRunner.Silent.class)
public class ResourceControllerTest {

    @InjectMocks
    private static ResourceController resourceController;

    @Before
    public void setUp() throws Exception {
        FieldSetter.setField(resourceController, ResourceController.class.getDeclaredField("languageFolder"), "dbfiles");
    }

    @Test
    public void getExistingFile() throws Exception {
        HttpEntity<?> response = resourceController.loadFile("words", "circle.png");
        byte[] data = (byte[])response.getBody();
        assertTrue(data.length > 0);
    }

    @Test(expected=Exception.class)
    public void getNonExistingFile() throws Exception {
        HttpEntity<?> response = resourceController.loadFile("words", "circle2.png");
        byte[] data = (byte[])response.getBody();
        assertTrue(data.length > 0);
    }
}
