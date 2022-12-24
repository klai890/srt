/*
 * Strava API v3
 * The [Swagger Playground](https://developers.strava.com/playground) is the easiest way to familiarize yourself with the Strava API by submitting HTTP requests and observing the responses before you write any client code. It will show what a response will look like with different endpoints depending on the authorization scope you receive from your athletes. To use the Playground, go to https://www.strava.com/settings/api and change your “Authorization Callback Domain” to developers.strava.com. Please note, we only support Swagger 2.0. There is a known issue where you can only select one scope at a time. For more information, please check the section “client code” at https://developers.strava.com/docs.
 *
 * OpenAPI spec version: 3.0.0
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.4.29
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/DetailedSegmentEffort', 'model/Fault'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/DetailedSegmentEffort'), require('../model/Fault'));
  } else {
    // Browser globals (root is window)
    if (!root.StravaApiV3) {
      root.StravaApiV3 = {};
    }
    root.StravaApiV3.SegmentEffortsApi = factory(root.StravaApiV3.ApiClient, root.StravaApiV3.DetailedSegmentEffort, root.StravaApiV3.Fault);
  }
}(this, function(ApiClient, DetailedSegmentEffort, Fault) {
  'use strict';

  /**
   * SegmentEfforts service.
   * @module api/SegmentEffortsApi
   * @version 3.0.0
   */

  /**
   * Constructs a new SegmentEffortsApi. 
   * @alias module:api/SegmentEffortsApi
   * @class
   * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the getEffortsBySegmentId operation.
     * @callback module:api/SegmentEffortsApi~getEffortsBySegmentIdCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/DetailedSegmentEffort>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * List Segment Efforts
     * Returns a set of the authenticated athlete's segment efforts for a given segment.  Requires subscription.
     * @param {Number} segmentId The identifier of the segment.
     * @param {Object} opts Optional parameters
     * @param {Date} opts.startDateLocal ISO 8601 formatted date time.
     * @param {Date} opts.endDateLocal ISO 8601 formatted date time.
     * @param {Number} opts.perPage Number of items per page. Defaults to 30. (default to 30)
     * @param {module:api/SegmentEffortsApi~getEffortsBySegmentIdCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/DetailedSegmentEffort>}
     */
    this.getEffortsBySegmentId = function(segmentId, opts, callback) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'segmentId' is set
      if (segmentId === undefined || segmentId === null) {
        throw new Error("Missing the required parameter 'segmentId' when calling getEffortsBySegmentId");
      }


      var pathParams = {
      };
      var queryParams = {
        'segment_id': segmentId,
        'start_date_local': opts['startDateLocal'],
        'end_date_local': opts['endDateLocal'],
        'per_page': opts['perPage'],
      };
      var collectionQueryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['strava_oauth'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = [DetailedSegmentEffort];

      return this.apiClient.callApi(
        '/segment_efforts', 'GET',
        pathParams, queryParams, collectionQueryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getSegmentEffortById operation.
     * @callback module:api/SegmentEffortsApi~getSegmentEffortByIdCallback
     * @param {String} error Error message, if any.
     * @param {module:model/DetailedSegmentEffort} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get Segment Effort
     * Returns a segment effort from an activity that is owned by the authenticated athlete. Requires subscription.
     * @param {Number} id The identifier of the segment effort.
     * @param {module:api/SegmentEffortsApi~getSegmentEffortByIdCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/DetailedSegmentEffort}
     */
    this.getSegmentEffortById = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling getSegmentEffortById");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var collectionQueryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['strava_oauth'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = DetailedSegmentEffort;

      return this.apiClient.callApi(
        '/segment_efforts/{id}', 'GET',
        pathParams, queryParams, collectionQueryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));
