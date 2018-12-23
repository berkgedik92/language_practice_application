package MockMRP;

import project.languageapp.Wrappers.MPRService;
import project.languageapp.Wrappers.MPRWrapper;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;

public class MPRServiceMocker {

    private static Map<String, Object> request;

    public static void mockMPRService(MPRService mockService) throws Exception {
        MPRWrapper wrapper = mock(MPRWrapper.class);

        doAnswer(invocation -> {
            Class c = invocation.getArgument(0);
            return c.cast(request.get("data"));
        }).when(wrapper).convertToObject(any(Class.class));

        doAnswer(invocation -> {
            String key = invocation.getArgument(0);
            return (Boolean) request.get(key);
        }).when(wrapper).getBoolean(any(String.class));

        doAnswer(invocation -> {
            String key = invocation.getArgument(0);
            return (String) request.get(key);
        }).when(wrapper).getString(any(String.class));

        doReturn(wrapper).when(mockService).createInstance(any());
    }

    public static void setRequest(Map<String, Object> request) {
        MPRServiceMocker.request = request;
    }
}
