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
    // AMD.
    define(['expect.js', '../../src/index'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    factory(require('expect.js'), require('../../src/index'));
  } else {
    // Browser globals (root is window)
    factory(root.expect, root.StravaApiV3);
  }
}(this, function(expect, StravaApiV3) {
  'use strict';

  var instance;

  describe('(package)', function() {
    describe('DetailedGear', function() {
      beforeEach(function() {
        instance = new StravaApiV3.DetailedGear();
      });

      it('should create an instance of DetailedGear', function() {
        // TODO: update the code to test DetailedGear
        expect(instance).to.be.a(StravaApiV3.DetailedGear);
      });

      it('should have the property brandName (base name: "brand_name")', function() {
        // TODO: update the code to test the property brandName
        expect(instance).to.have.property('brandName');
        // expect(instance.brandName).to.be(expectedValueLiteral);
      });

      it('should have the property modelName (base name: "model_name")', function() {
        // TODO: update the code to test the property modelName
        expect(instance).to.have.property('modelName');
        // expect(instance.modelName).to.be(expectedValueLiteral);
      });

      it('should have the property frameType (base name: "frame_type")', function() {
        // TODO: update the code to test the property frameType
        expect(instance).to.have.property('frameType');
        // expect(instance.frameType).to.be(expectedValueLiteral);
      });

      it('should have the property description (base name: "description")', function() {
        // TODO: update the code to test the property description
        expect(instance).to.have.property('description');
        // expect(instance.description).to.be(expectedValueLiteral);
      });

    });
  });

}));
