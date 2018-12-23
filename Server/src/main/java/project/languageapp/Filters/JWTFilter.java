package project.languageapp.Filters;

import io.jsonwebtoken.Claims;
import project.languageapp.Language.Model.User;
import project.languageapp.Services.TokenManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;

//Checks authentication token sent by user, if token is invalid, throws exception and does not send the request to controllers
@Component
@Order(2)
class JWTFilter implements Filter {

    @Autowired
    private TokenManager tokenManager;

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    private final List<String> tokenRequired = Arrays.asList("api", "token");

    @Override
    public void doFilter(final ServletRequest req,
                         final ServletResponse res,
                         final FilterChain chain) throws IOException, ServletException {

        final HttpServletRequest request = (HttpServletRequest)req;
        String requestedURI = request.getRequestURI();

        //For preflight requests, do not look for authentication token
        if ("OPTIONS".equals(request.getMethod())) {
            chain.doFilter(req, res);
            return;
        }

        String[] requestURIParts = requestedURI.substring(1).split("/");

        // If the user tries to make a request to a place where a token is required, isValid its token
        if (tokenRequired.contains(requestURIParts[0])) {

            LOGGER.info("JWTFilter : Access requested for " + requestURIParts[0]);
            String authHeader = request.getHeader("Auth");
            Claims claims;

            try {
                // If the user does not have a token, reject the request
                if (authHeader == null) {
                    LOGGER.severe("JWTFilter : Missing authorization header");
                    throw new ServletException("Missing Authorization header");
                }

                // Check if the token is valid. (If it is not valid, it will throw an exception)
                User user = tokenManager.check(authHeader);
                request.setAttribute("userdata", user);

            } catch (Exception e) {
                HttpServletResponse httpResponse = (HttpServletResponse)res;
                httpResponse.sendError(401, e.getMessage());
                return;
            }
        }

        chain.doFilter(req, res);
    }

    public void init(FilterConfig filterConfig) {

    }

    public void destroy() {

    }
}