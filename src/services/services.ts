const services = {
  public: {},
  private: {
    loginUpdates: "/bancalinea-api/core/v1/login-updates-bel",
    avaliablePayments: "/bancalinea-api/core/v1/getavailablepayments",
    getKey: "/encryption-api/get-key",
    getData: "/encryption-api/obtain-data",
  },
  protected: {},
};

export default services;
