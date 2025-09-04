import { makeAutoObservable, runInAction } from "mobx";

class MarketStore {

  // main states
  sceneReady = false;


  markets = [];
  loading = true;
  searchQuery = "";
  selectedMarket = null; // For storing the selected market details
  currentPage = 1;
  itemsPerPage = 9;

   // chart
  chartData = [];
  chartWs = null;
  // buffer & aggregation
  wsBuffer = [];
  AGGREGATION_COUNT = 3;  // 3 ticka = 9s
  interval = '1m';
  maxCandles = 50;
  currentZoom = null;
  pricePeriods = {
  "24h": { interval: "1h", limit: 24 },
  "7d": { interval: "4h", limit: 42 },   // 7 days, 4h steps
  "30d": { interval: "1d", limit: 30 },  // 30 days, daily
};

  // selected market, user options
  priceChangePeriod = '24h'; // default to 24h

  // User interaction
  comparisonMode = false;
  comparedMarkets = []; 

  constructor() {
    makeAutoObservable(this);
  }

  setSceneReady(value) {
    this.sceneReady = value;  
  }

  // Action: set the search query and reset to first page
  setSearchQuery(query) {
    this.searchQuery = query;
    this.currentPage = 1;
  }

  // kad se promijeni selektirani market, startamo ili gasimo WS
  setSelectedMarket(market) {
    this.selectedMarket = market;

 /*    if (market) {
    
    this.subscribeChartData(market.symbol);  
      
  this.loadHistoricalChartData(market.symbol, '1h', 24);  
    } else {
      this.unsubscribeChartData();
    } */
  }

  // Fetch markets from API
  async fetchMarkets() {
    this.loading = true;
    try {
      const baseUrl =
        window.location.hostname === "localhost"
          ? "http://127.0.0.1:8000/"
          : "https://cchain.fitapp.cloud";

     /* const response = await fetch(`${baseUrl}/test-api`);   */   
    const response = await fetch(`http://127.0.0.1:8000/test-api`);    
 
       const data = await response.json();

      runInAction(() => {
        this.markets = Array.isArray(data) ? data : [];
        
      });
    } catch (error) {
      console.error("Error fetching markets:", error);
      runInAction(() => {
        this.markets = [];
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  // Computed: filtered list based on search query
  get filteredMarkets() {
    const q = this.searchQuery.toLowerCase();
    return this.markets.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.symbol.toLowerCase().includes(q)
    );
  }

  // Computed: total pages based on filtered results
  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredMarkets.length / this.itemsPerPage));
  }

  // Computed: paginated slice of filtered results
  get paginatedMarkets() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = this.currentPage * this.itemsPerPage;
    return this.filteredMarkets.slice(start, end);
  }

  // Actions: pagination
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  // Subscribe to Binance kline_1m stream, uvijek s USDT parom
    setInterval(interval) {
    this.interval = interval;
    if (this.selectedMarket) {
      this.subscribeChartData(); // resubscribe with new interval
    }
  }

   subscribeChartData() {
    // zatvori postojeći WS (ako ima)
    if (this.chartWs) {
      this.chartWs.close();
      this.chartWs = null;
    }

    // očisti buffer i chartData
    this.wsBuffer = [];
    runInAction(() => { this.chartData = []; });

    // pripremi novi WS
    const symbol = this.selectedMarket.symbol.toLowerCase();
    const pair = symbol.endsWith('usdt') ? symbol : `${symbol}usdt`;
    const wsUrl = `wss://stream.binance.com:9443/ws/${pair}@kline_${this.interval}`;

    this.chartWs = new WebSocket(wsUrl);

    this.chartWs.onmessage = (e) => {
      const { k } = JSON.parse(e.data);
      // svaki tick uzmemo samo cijenu i timestamp
      const tick = {
        price: parseFloat(k.c),   // za agregaciju uzimamo close
        timestamp: k.t,
      };

      this.wsBuffer.push(tick);

      // kad skupimo 3 ticka, formiramo candle
      if (this.wsBuffer.length === this.AGGREGATION_COUNT) {
        const candle = this.buildCandle(this.wsBuffer);
        runInAction(() => {
          this.chartData.push(candle);
          if (this.chartData.length > this.maxCandles) {
            this.chartData.shift();
          }
        });
        this.wsBuffer = []; // reset za sljedeću svijeću
      }
    };

    this.chartWs.onclose = () => { this.chartWs = null; };
    this.chartWs.onerror = (err) => console.error(err);
  }

  unsubscribeChartData() {
    if (this.chartWs) this.chartWs.close();
    runInAction(() => {
      this.chartData = [];
      this.wsBuffer = [];
    });
  }

  /** 
   * Pretvori grupu tickova u jednu OHLC svijeću.
   * Uzima open = prvi.price, close = zadnji.price,
   * high = max, low = min, time = prvi.timestamp
   */
  buildCandle(ticks) {
    const prices = ticks.map(t => t.price);
    return {
      time: ticks[0].timestamp,
      open: prices[0],
      high: Math.max(...prices),
      low:  Math.min(...prices),
      close: prices[prices.length - 1],
    };
  }

 async loadHistoricalChartData(symbol) {
  this.loading = true;

  try {
    const period = this.pricePeriods[this.priceChangePeriod] || this.pricePeriods["24h"];
    const { interval, limit } = period;

    const pair = symbol.endsWith('usdt') ? symbol.toUpperCase() : `${symbol.toUpperCase()}USDT`;
    const url = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`;

    const res = await fetch(url);
    const data = await res.json();

    const candles = data.map(d => ({
      time: d[0],
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low:  parseFloat(d[3]),
      close: parseFloat(d[4]),
    }));

    runInAction(() => {
      this.chartData = candles;
    });
  } catch (err) {
    console.error("Failed to load historical data", err);
    runInAction(() => {
      this.chartData = [];
    });
  } finally {
    runInAction(() => {
      this.loading = false;
    });
  }
}

setPriceChangePeriod(period) {
  this.priceChangePeriod = period;
  if (this.selectedMarket) {
    this.loadHistoricalChartData(this.selectedMarket.symbol);
  }
}

  setCurrentZoom(zoom) {
    this.currentZoom = zoom;
  }
  get currentZoomLevel() {
    return this.currentZoom;
  }


  // Comparison mode
  toggleComparisonMode() {
    this.comparisonMode = !this.comparisonMode;
    if (!this.comparisonMode) {
      this.comparedMarkets = [];
    }
  }

  addComparedMarket(market) {
    if (!this.comparedMarkets.find(m => m.id === market.id)) {
      this.comparedMarkets.push(market);
    }
  }

  removeComparedMarket(marketId) {
    this.comparedMarkets = this.comparedMarkets.filter(m => m.id !== marketId);
  }


  zoomFactor() {
    // if zoom  < 1.5 set candlesGroup to 1second
    // if zoom > 1.5 set interval and < 2.5 set candlesGroup to 1minute 
    // if zoom > 2.5 set interval and < 3.5 set candlesGroup to 1hour
    // if zoom > 3.5 set interval and < 4.5 set candlesGroup to 1day

    if (this.currentZoom < 1.5) {
      return '1s';
    } else if (this.currentZoom < 2.5) {
      return '1m';
    } else if (this.currentZoom < 3.5) {
      return '1h';
    } else {
      return '1d';
    }
  }

}

export default MarketStore;
