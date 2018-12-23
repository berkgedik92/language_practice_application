package project.languageapp.Wrappers;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartHttpServletRequest;

@Service
public class MPRService {

    public MPRWrapper createInstance(MultipartHttpServletRequest request) {
        return new MPRWrapper(request);
    }
}
