Feature: User Data Import API
  As an API client
  I want to import user datasets
  So that they are available in the platform

  @api
  Scenario: Import XLSX dataset via API
    Given I have a valid API access token
    When I upload dataset "Sample XLSX" from file "indonesia_data_10000r_20c_point_geojson_land.xlsx" with mime "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    Then the import operation should succeed

  @api
  Scenario: Import CSV dataset via API
    Given I have a valid API access token
    When I upload dataset "Sample CSV" from file "indonesia_data_10000r_20c_point_geojson_land.csv" with mime "text/csv"
    Then the import operation should succeed

