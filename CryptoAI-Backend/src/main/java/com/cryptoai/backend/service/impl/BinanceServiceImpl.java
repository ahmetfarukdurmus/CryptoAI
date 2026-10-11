package com.cryptoai.backend.service.impl;

import com.cryptoai.backend.dto.response.BinanceTickerDto;
import com.cryptoai.backend.dto.response.KlineDto;
import com.cryptoai.backend.dto.response.MarketDataDto;
import com.cryptoai.backend.exception.ApiException;
import com.cryptoai.backend.service.BinanceService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BinanceServiceImpl implements BinanceService {

    private static final Logger log = LoggerFactory.getLogger(BinanceServiceImpl.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${binance.api.base-url:https://api.binance.com}")
    private String baseUrl = "https://api.binance.com";

    private static final List<String> POPULAR_SYMBOLS = List.of(
            "BTCUSDT", "ETHUSDT", "SOLUSDT", "AVAXUSDT", "BNBUSDT",
            "XRPUSDT", "DOGEUSDT", "ADAUSDT", "DOTUSDT", "LINKUSDT",
            "NEARUSDT", "TRXUSDT", "SHIBUSDT", "LTCUSDT", "APTUSDT",
            "SUIUSDT", "PEPEUSDT"
    );

    private static final Map<String, String> COIN_NAMES = Map.ofEntries(
            Map.entry("BTC", "Bitcoin"),
            Map.entry("ETH", "Ethereum"),
            Map.entry("SOL", "Solana"),
            Map.entry("AVAX", "Avalanche"),
            Map.entry("BNB", "BNB"),
            Map.entry("XRP", "Ripple"),
            Map.entry("DOGE", "Dogecoin"),
            Map.entry("ADA", "Cardano"),
            Map.entry("DOT", "Polkadot"),
            Map.entry("LINK", "Chainlink"),
            Map.entry("NEAR", "NEAR Protocol"),
            Map.entry("TRX", "TRON"),
            Map.entry("SHIB", "Shiba Inu"),
            Map.entry("LTC", "Litecoin"),
            Map.entry("APT", "Aptos"),
            Map.entry("SUI", "Sui"),
            Map.entry("PEPE", "Pepe")
    );

    // Son çekilen fiyatları kısa süreli önbellekte tutmak için (Binance kesintisinde koruma)
    private final Map<String, MarketDataDto> tickerCache = new ConcurrentHashMap<>();

    // 1. Parametresiz default constructor (Spring ve reflection uyumluluğu için)
    public BinanceServiceImpl() {
        this(new RestTemplate(), new ObjectMapper(), "https://api.binance.com");
    }

    // 2. Spring Dependency Injection constructor (@Autowired)
    @Autowired
    public BinanceServiceImpl(RestTemplate restTemplate,
                              ObjectMapper objectMapper,
                              @Value("${binance.api.base-url:https://api.binance.com}") String baseUrl) {
        this.restTemplate = restTemplate != null ? restTemplate : new RestTemplate();
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
        this.baseUrl = (baseUrl != null && !baseUrl.isBlank()) ? baseUrl : "https://api.binance.com";
    }

    // 3. Test ve yardımcı constructor'lar
    public BinanceServiceImpl(RestTemplate restTemplate) {
        this(restTemplate, new ObjectMapper(), "https://api.binance.com");
    }

    public BinanceServiceImpl(RestTemplate restTemplate, String baseUrl) {
        this(restTemplate, new ObjectMapper(), baseUrl);
    }

    @Override
    public List<MarketDataDto> getPopularTickers() {
        log.info("Binance popüler ticker verileri çekiliyor...");

        try {
            String symbolsParam = "[\"" + String.join("\",\"", POPULAR_SYMBOLS) + "\"]";
            String url = baseUrl + "/api/v3/ticker/24hr?symbols={symbols}";

            BinanceTickerDto[] response = restTemplate.getForObject(url, BinanceTickerDto[].class, symbolsParam);

            if (response != null && response.length > 0) {
                List<MarketDataDto> marketDataList = new ArrayList<>();
                for (BinanceTickerDto ticker : response) {
                    MarketDataDto dto = mapToMarketDataDto(ticker);
                    marketDataList.add(dto);
                    tickerCache.put(dto.getSymbol(), dto);
                    tickerCache.put(dto.getPair(), dto);
                }
                return marketDataList;
            }
        } catch (Exception ex) {
            log.warn("Binance popüler ticker servisine erişilemedi: {}", ex.getMessage());
        }

        // Önbellekte veri varsa döndür
        if (!tickerCache.isEmpty()) {
            log.info("Önbellekteki ticker verileri döndürülüyor.");
            Set<String> added = new HashSet<>();
            List<MarketDataDto> cachedList = new ArrayList<>();
            for (String pair : POPULAR_SYMBOLS) {
                MarketDataDto item = tickerCache.get(pair);
                if (item != null && added.add(item.getSymbol())) {
                    cachedList.add(item);
                }
            }
            if (!cachedList.isEmpty()) {
                return cachedList;
            }
        }

        throw new ApiException("Binance piyasa verilerine şu anda ulaşılamıyor. Lütfen tekrar deneyiniz.", HttpStatus.SERVICE_UNAVAILABLE);
    }

    @Override
    public List<KlineDto> getKlines(String symbol, String interval, int limit) {
        String pair = normalizePair(symbol);
        String validInterval = normalizeInterval(interval);
        int validLimit = (limit <= 0 || limit > 500) ? 50 : limit;

        log.info("Binance mum grafiği verisi çekiliyor: pair={}, interval={}, limit={}", pair, validInterval, validLimit);

        try {
            String url = baseUrl + "/api/v3/klines?symbol={symbol}&interval={interval}&limit={limit}";
            String rawJson = restTemplate.getForObject(url, String.class, pair, validInterval, validLimit);

            if (rawJson == null || rawJson.isBlank()) {
                throw new ApiException("Mum grafiği verisi boş döndü", HttpStatus.NOT_FOUND);
            }

            List<List<Object>> rawList = objectMapper.readValue(rawJson, new TypeReference<>() {});
            List<KlineDto> klines = new ArrayList<>();

            for (List<Object> k : rawList) {
                if (k.size() >= 7) {
                    Long openTime = ((Number) k.get(0)).longValue();
                    BigDecimal open = new BigDecimal(k.get(1).toString());
                    BigDecimal high = new BigDecimal(k.get(2).toString());
                    BigDecimal low = new BigDecimal(k.get(3).toString());
                    BigDecimal close = new BigDecimal(k.get(4).toString());
                    BigDecimal volume = new BigDecimal(k.get(5).toString());
                    Long closeTime = ((Number) k.get(6)).longValue();

                    klines.add(KlineDto.builder()
                            .openTime(openTime)
                            .open(open)
                            .high(high)
                            .low(low)
                            .close(close)
                            .volume(volume)
                            .closeTime(closeTime)
                            .build());
                }
            }

            return klines;
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Binance mum verisi alınırken hata: symbol={}, hata={}", pair, ex.getMessage());
            throw new ApiException(pair + " paritesi için mum verileri alınamadı: " + ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public BigDecimal getCurrentPrice(String symbol) {
        String pair = normalizePair(symbol);

        // Önce hızlıca cache kontrolü
        MarketDataDto cached = tickerCache.get(pair);
        if (cached != null && cached.getCurrentPrice() != null) {
            // Cache mevcut
        }

        try {
            String url = baseUrl + "/api/v3/ticker/price?symbol={symbol}";
            Map<?, ?> response = restTemplate.getForObject(url, Map.class, pair);
            if (response != null && response.containsKey("price")) {
                return new BigDecimal(response.get("price").toString());
            }
        } catch (Exception ex) {
            log.warn("Canlı fiyat sorgulanamadı ({}): {}", pair, ex.getMessage());
        }

        // Cache fallback
        if (cached != null && cached.getCurrentPrice() != null) {
            return cached.getCurrentPrice();
        }

        throw new ApiException(pair + " için güncel fiyat Binance üzerinden alınamadı.", HttpStatus.BAD_REQUEST);
    }

    @Override
    public Map<String, BigDecimal> getPricesForSymbols(List<String> symbols) {
        Map<String, BigDecimal> result = new HashMap<>();
        if (symbols == null || symbols.isEmpty()) {
            return result;
        }

        // Popüler ticker'ları çekerek toplu fiyat eşlemesi yap
        try {
            List<MarketDataDto> tickers = getPopularTickers();
            Map<String, BigDecimal> priceMap = new HashMap<>();
            for (MarketDataDto t : tickers) {
                priceMap.put(t.getSymbol().toUpperCase(), t.getCurrentPrice());
                priceMap.put(t.getPair().toUpperCase(), t.getCurrentPrice());
            }

            for (String sym : symbols) {
                String cleanSym = sym.toUpperCase().replace("USDT", "");
                String pair = cleanSym + "USDT";
                if (priceMap.containsKey(cleanSym)) {
                    result.put(cleanSym, priceMap.get(cleanSym));
                } else if (priceMap.containsKey(pair)) {
                    result.put(cleanSym, priceMap.get(pair));
                } else {
                    try {
                        result.put(cleanSym, getCurrentPrice(pair));
                    } catch (Exception ignored) {
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Toplu fiyat haritası oluşturulurken hata: {}", ex.getMessage());
            for (String sym : symbols) {
                try {
                    String cleanSym = sym.toUpperCase().replace("USDT", "");
                    result.put(cleanSym, getCurrentPrice(cleanSym));
                } catch (Exception ignored) {
                }
            }
        }

        return result;
    }

    private String normalizePair(String symbol) {
        if (symbol == null || symbol.isBlank()) {
            return "BTCUSDT";
        }
        String clean = symbol.trim().toUpperCase();
        if (!clean.endsWith("USDT")) {
            return clean + "USDT";
        }
        return clean;
    }

    private String normalizeInterval(String interval) {
        if (interval == null || interval.isBlank()) {
            return "1h";
        }
        String lower = interval.trim().toLowerCase();
        if (lower.equals("1d")) return "1d";
        if (lower.equals("15m") || lower.equals("1h") || lower.equals("4h") || lower.equals("1w") || lower.equals("5m")) {
            return lower;
        }
        return "1h";
    }

    private MarketDataDto mapToMarketDataDto(BinanceTickerDto t) {
        String pair = t.getSymbol();
        String symbol = pair.endsWith("USDT") ? pair.substring(0, pair.length() - 4) : pair;
        String name = COIN_NAMES.getOrDefault(symbol, symbol);

        return MarketDataDto.builder()
                .symbol(symbol)
                .pair(pair)
                .name(name)
                .currentPrice(t.getLastPrice())
                .change24h(t.getPriceChangePercent())
                .high24h(t.getHighPrice())
                .low24h(t.getLowPrice())
                .volume24h(t.getVolume())
                .build();
    }
}
