Feature: Datasets APIs
  As an API client
  I want to list datasets and inspect schema
  So that I can understand available data

  Background:
    Given I have a valid API access token

  @api
  Scenario: Get BVT datasets
    When I list datasets by source "bvt"
    Then each dataset should have source "bvt"

  @api
  Scenario: Get User datasets
    When I list datasets by source "user"
    Then each dataset should have source "user"

  @api
  Scenario: Get H3 datasets
    When I list datasets with aggregation "H3"
    Then each dataset should have aggregation "H3"

  @api
  Scenario: Get POI datasets
    When I list datasets with aggregation "POI"
    Then each dataset should have aggregation "POI"

  @api
  Scenario: Get Thematic datasets
    When I list datasets with aggregation "adm_area"
    Then each dataset should have aggregation "adm_area"

  @api
  Scenario: Get schema for a random collected id
    When I fetch schema for a random collected dataset id
    Then the schema should be a non-empty array

