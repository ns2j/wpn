package wpn;

import java.security.GeneralSecurityException;
import java.security.Security;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import nl.martijndwars.webpush.PushService;

@Configuration
public class WebPushConfig {
    WebPushProperties webPushProperties;

    public WebPushConfig(WebPushProperties webPushProperties) {
        this.webPushProperties = webPushProperties;
    }
    
    @ConfigurationProperties(prefix = "wpn")
    public record WebPushProperties(String vapidPublicKey, String vapidPrivateKey) {}

    @Bean
    public PushService pushService() throws GeneralSecurityException {
        Security.addProvider(new BouncyCastleProvider());
        return new PushService(webPushProperties.vapidPublicKey(), webPushProperties.vapidPrivateKey, "mailto:foo@example.com");
    }
}

