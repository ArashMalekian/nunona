var loadScript = function(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    // If the browser is Internet Explorer
    if (script.readyState){
      script.onreadystatechange = function() {
        if (script.readyState == "loaded" || script.readyState == "complete") {
          script.onreadystatechange = null;
          callback();
        }
      };
      // For any other browser
    } else {
      script.onload = function() {
        callback();
      };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
};

Bundle = {
  Defaults: {
    // Convenience functions to reference various important divs within the build.
    // If you structure your HTML differently than our example build, you can alter these
    // functions to reference the correct divs.
    getBundleDiv: function () {
      return $(".bundle");
    },
    getBundleGridDiv: function () {
      return Bundle.Defaults.getBundleDiv().find(".bundle-grid");
    },
    getBundleDetailsDiv: function () {
      return Bundle.Defaults.getBundleDiv().find(".bundle-details");
    },
    getAddToCartDiv: function () {
      return $("#bundle-add-to-cart");
    },
    getWidget: function () {
      return ReChargeWidget.getWidgets()[0];
    },
  },
  Utils: {
    // Utilty functions used throughout the rest of the build
    generateGuid: function () {
      // Generates a unique guid to be used for the bundle_id
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    },
    calculateBundleQuantity: function ($bundle) {
      // Calculates the total number of items selected on the page.
      // Will loop through all grid items and sum up the total bundle
      // quantity based on the data-qty attribute of each variant.
      // 1.) $bundle = top level bundle div of the grid matrix
      var bundle_qty = 0;
      $bundle.find(".bundle-item").each(function () {
        bundle_qty += Number($(this).attr("data-qty"));
      });
      return bundle_qty;
    },
    isSubscription: function (widget) {
      // Determines whether the user has selected the One-time purchase
      // or Subscribe and Save option on the ReCharge widget
      return widget.subscriptionActive == true;
    },
    updateBundleQuantity: function ($item, increment) {

      // Main function to handle quantity manipulation. Pass in the grid
      // item along with the quantity to increment or decrement. Then it will
      // determine the current and new item/bundle quantities. Then it checks
      // constraints, and if valid, update all necessary data attributes,
      // interface output, and enable/disable any buttons.
      // 1.) $item = the clicked plus or minus .bundle-item parent div
      // 2.) increment = the amount to increase or decrease the quantity
      // Get bundle parent reference and min/max numbers
      var $bundle = $item.closest(".bundle-grid");
      var bundle_min = Number($bundle.attr("data-bundle-min"));
      var bundle_max = Number($bundle.attr("data-bundle-max"));
      // Calculate current item and bundle quantity
      var bundle_qty = Bundle.Utils.calculateBundleQuantity($bundle);
      var item_qty = Number($item.attr("data-qty"));
      // Calculate the new bundle and item quantities with the increment added
      var new_bundle_qty = bundle_qty + increment;
      var new_item_qty = item_qty + increment;
      // Check constraints to make sure we can perform the action
      if (
        Bundle.Constraints.isItemGreaterThanZero(new_item_qty) &&
        Bundle.Constraints.isBundleGreaterThanMin(new_bundle_qty, bundle_min) &&
        Bundle.Constraints.isBundleLessThanMax(new_bundle_qty, bundle_max)
      ) {
        //Update quantities
        $item.attr("data-qty", new_item_qty);
        $item.find(".bundle_quantity").html(new_item_qty);
        $(".current-qty").html(new_bundle_qty);
        //Toggle the Add to Cart Button if max items is reached
        var is_disabled = Bundle.Constraints.isBundleEqualMax(
          new_bundle_qty,
          bundle_max
        )
          ? false
          : true;
        Bundle.Defaults.getAddToCartDiv().prop("disabled", is_disabled);
        //Update plus/minus button's disabled property
        $bundle.find(".bundle-item").each(function () {
          var item_qty = $(this).attr("data-qty");
          var is_disabled = Bundle.Constraints.isBundleEqualParam(
            new_bundle_qty,
            bundle_max
          )
            ? true
            : false;
          $(this).find(".plus").find(".btn").prop("disabled", is_disabled);
          var is_disabled =
            Bundle.Constraints.isBundleEqualParam(new_bundle_qty, bundle_min) ||
            Bundle.Constraints.isBundleEqualParam(item_qty, 0)
              ? true
              : false;
          $(this).find(".minus").find(".btn").prop("disabled", is_disabled);
        });
      }

      if( new_item_qty > 0 ) {

          $( "#bundle-add-to-cart" ).prop('disabled', false);

      }
      else {

          $( "#bundle-add-to-cart" ).prop('disabled', true);

      }

    },
    updatePrice: function () {
      var widget = Bundle.Defaults.getWidget();
      var is_subscription = Bundle.Utils.isSubscription(widget);
      var $bundle = Bundle.Defaults.getBundleGridDiv();
      var bundle_subscription_price = $bundle.attr("data-subscription-price");
      var bundle_onetime_price = $bundle.attr("data-onetime-price");
      //If subscription option is clicked, display discounted subscription price
      //Otherwise, display full bundle price
      if (is_subscription) {
        $(".bundle-price").html(bundle_subscription_price);
      } else {
        $(".bundle-price").html(bundle_onetime_price);
      }
    },
  },
  Constraints: {
    // Requirement functions to determine whether the user is
    // performing an action that is forbidden
    isItemGreaterThanZero: function (qty) {
      // Check that the item quantity doesn't fall below zero
      // 1.) qty = item quantity of the variant
      if (qty < 0) {
        console.log("Item quantity cannot be less than 0.");
        return false;
      }
      return true;
    },
    isBundleGreaterThanMin: function (qty, min) {
      // Check that the bundle quantity doesn't fall below the minimum quantity
      // 1.) qty = total bundle quantity of the page
      // 2.) min = minimum value the bundle quantity can't fall below
      if (qty < min) {
        console.log("Quantity cannot be less than the minimum.");
        return false;
      }
      return true;
    },
    isBundleLessThanMax: function (qty, max) {
      // Check that the bundle quantity doesn't go above the maximum quantity
      // 1.) qty = total bundle quantity of the page
      // 2.) max = maximum value the bundle quantity can't rise above
      if (qty > max) {
        console.log("Quantity cannot be greater than maximum.");
        return false;
      }
      return true;
    },
    isBundleEqualMax: function (qty, max) {
      // Check that the bundle quantity is equal to the maximum quantity
      // 1.) qty = total bundle quantity of the page
      // 2.) max = maximum value the bundle quantity can't rise above
      return qty == max ? true : false;
    },
    isBundleEqualParam: function (qty, param) {
      // Check that the bundle quantity is equal to param
      // 1.) qty = total bundle quantity of the page
      // 2.) param = value to compare qty against
      return qty == param ? true : false;
    },
  },
  Cart: {
    // Functions used when adding the bundle to the cart and removing a bundle from the cart
    processAddToCart: function () {
      // Top level function tied to the Add to Cart button.
      // Function will check constraints to make sure we can
      // add the bundle to the cart, then it will generate
      // the cart array and make the AJAX call to Shopify's API.
      // Once added to cart, we redirect to the /cart page.
      // Get bundle parent, bundle max value, and total bundle quantity values
      var $bundle = Bundle.Defaults.getBundleGridDiv();
      var qty = Bundle.Utils.calculateBundleQuantity($bundle);
      var bundle_max = Number($bundle.attr("data-bundle-max"));
      // Ensure we can process the cart, and if not, break out of function
      if (!Bundle.Constraints.isBundleEqualMax(qty, bundle_max)) {
        console.log(
          "Cannot process Add to Cart. Qty does not equal max total."
        );
        return;
      }
      //Generate the product array to pass to AJAX call
      var widget = Bundle.Defaults.getWidget();
      var items = Bundle.Cart.generateCart($bundle, widget);
      // Ensure there are items to add to cart, and if so, make
      // API call and redirect to /cart page
      if (items.length > 0) {
        Bundle.Cart.processToCart(items);
      } else {
        console.log("No items available to add to cart.");
      }
    },
    generateCart: function ($bundle, widget) {
      // Check that the bundle quantity is equal to param
      // 1.) $bundle = top level bundle div of the grid matrix
      // 2.) widget = the ReCharge widget object tied to the page
      var cart = [];
      var is_subscription = Bundle.Utils.isSubscription(widget);
      // bundle_id that we will pass to each product object as a
      // line item property to associate them to this bundle
      var bundle_id = Bundle.Utils.generateGuid();
      // Determine whether the user has the One-time purchase or
      // Subscribe & Save purchase type option selected. If Subscribe
      // & Save, generate the shipping interval unit_type and frequency
      // that are passed through on ReCharge orders.
      if (is_subscription) {
        var selling_plan = widget.state.sellingPlanId;
      }
      // Loop through each product grid item
      $bundle.find(".bundle-item").each(function () {
        // If item's quantity is greater than 0, add
        // to the cart array
        var qty = $(this).attr("data-qty");
        if (Number(qty) > 0) {
          var variant_id = $(this).attr("data-variant-id");
          // Pass the variant_id, quantity, and bundle_id
          // for each grid item we process
          var item = {
            id: variant_id,
            quantity: qty,
            properties: {
              bundle_id: bundle_id,
            },
          };
          // If this is a Subscribe & Save bundle, pass in the
          // ReCharge properties too
          if (is_subscription) {
            item["selling_plan"] = selling_plan;
          }
          cart.push(item);
        }
      });
      return cart;
    },
    processToCart: function (items) {
      // Makes API call to add bundle items to cart. If the
      // call is successful, redirect to /cart page. If error,
      // display the error to the console.
      // 1.) items = the product array to be passed to the Shopify
      // API. Bundle.Cart.generateCart() function builds this array.
      $.ajax({
        type: "POST",
        url: "/cart/add.js",
        data: {
          items: items,
        },
        dataType: "json",
        success: function () {
          window.location.href = "/cart";
        },
        error: function (jqXHR, text_status, error_thrown) {
          console.log(text_status, error_thrown);
        },
      });
    },
    removeBundleItems: function (bundle_id) {
      // Removes all bundle items from cart when user clicks remove on cart page
      // Get current cart contents
      jQuery.getJSON("/cart.js", function (cart) {
        // Create new updates object to send to cart update AJAX call
        // Loop through each cart item
        // If the item's bundle id matches the id passed in,
        // add the cart item key along with quantity of 0 to the data object
        let bundle_items = [];
        let qty = 0;
        let data = { updates: {} };
        cart.items.forEach((item, i) => {
          if (
            item.properties.bundle_id &&
            item.properties.bundle_id == bundle_id
          ) {
            data.updates[item.key] = 0;
          }
        });
        // API call to update the cart contents and set the bundle item quantities to 0
        $.ajax({
          type: "POST",
          url: "/cart/update.js",
          data: data,
          dataType: "json",
          success: function () {
            window.location.href = "/cart";
          },
        });
      });
    },
  },
  init: function () {

      console.log( 'bundle init' );

    // Initialization function to register all click handlers
    // Registers each grid item's minus button
    $("body").on("click", ".bundle .minus", function () {
      var item = $(this).closest(".bundle-item");
      Bundle.Utils.updateBundleQuantity(item, -1);
    });
    // Registers each grid item's plus button
    $("body").on("click", ".bundle .plus", function () {
      var item = $(this).closest(".bundle-item");
      Bundle.Utils.updateBundleQuantity(item, 1);
    });
    // Registers the page's Add to Cart button
    $("body").on("click", "#bundle-add-to-cart", function () {
      event.preventDefault();
      Bundle.Cart.processAddToCart();
    });
    // Registers function to handle price change when user changes subscription vs one-time
    $("body").on("change", ".rc-widget input", function () {
      Bundle.Utils.updatePrice();
    });
    // Registers each cart bundle item's remove button
    $("body").on("click", ".cart__remove-bundle", function () {
      var bundle_id = $(this)
        .closest(".cart__remove-bundle")
        .attr("data-bundle-id");
      Bundle.Cart.removeBundleItems(bundle_id);
    });
  },
};


if (document.querySelector('.product-bundle-steps')) {
  if ((typeof(jQuery) == 'undefined') || (parseInt(jQuery.fn.jquery) == 1 && parseFloat(jQuery.fn.jquery.replace(/^1\./,"")) < 7.2)) {

    loadScript('//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {

      $ = jQuery.noConflict();

      // Call the init() function to register click handlers
      Bundle.init();



    });

  }

  jQuery( function() {

    if( jQuery( 'body' ).hasClass( 'template-product' ) ) {

        jQuery( '#stamped-main-widget' ).appendTo( '#page-content' );

    }

    jQuery( '.choose-your-plan button' ).on( 'click', function() {

        jQuery('html, body').animate({
            scrollTop: jQuery( '.product-bundle-step2' ).offset().top - 100
        }, 500);

    } );

    jQuery( '.choose-my-flavor button' ).on( 'click', function() {

      var checked_plan = jQuery( '.checkbox-plan-trial:checked' ).val();

      if( checked_plan ) {

        if( checked_plan <= 2 ) {

          jQuery( '.product-bundle-step3 .product-bundle-progress' ).css( 'display', 'flex' );

          jQuery( '.template-product #recharge-bundles' ).show();

          // jQuery( '.template-product .section-featured-product' ).hide();

          jQuery( '.template-product .section-featured-product' ).css( { 'opacity' : 0, 'visibility': 'hidden', 'height': 0 } ).show();

          jQuery('html, body').animate({
              scrollTop: jQuery( '.product-bundle-step3 .product-bundle-progress' ).offset().top - 100
          }, 500);

          if( checked_plan == 1 ) {

            // jQuery( '#page-content' ).find( '.rb-select option:eq(0)' ).prop('selected', true);

            // jQuery( '.template-product .section-featured-product' ).show();

            jQuery( '.template-product .section-featured-product' ).css( { 'opacity' : 1, 'visibility': 'visible', 'height': 'auto' } ).show();

            jQuery( '.template-product #recharge-bundles' ).hide();

            jQuery('html, body').animate({
                scrollTop: jQuery( '.product-bundle-step3 .product-bundle-progress' ).offset().top - 100
            }, 500);

          }
          else if( checked_plan == 2 ) {

            jQuery( '#page-content' ).find( '.rb-select option:eq(1)' ).prop('selected', true);

          }

          }
          else {

          let monthly_prod_url = jQuery( '.product-bundle-plans li.active' ).data( 'url' );

          window.location.href = monthly_prod_url;

          }

      }


  } );

    // jQuery( '.product-bundle-btn-wrap button' ).on( 'click', function() {

    //     jQuery('html, body').animate({
    //         scrollTop: jQuery( '#recharge-bundles' ).offset().top - 100
    //     }, 500);

    // } );

    jQuery( '.checkbox-plan-trial' ).on( 'change', function() {

        $('.checkbox-plan-trial').prop('checked', false);

        $( this ).prop('checked', true);

        jQuery( '.template-product .section-featured-product' ).hide();

        jQuery( '.template-product #recharge-bundles' ).hide();

    } );

    jQuery( '.product-bundle-plans li' ).on( 'click', function() {
      ReChargeWidget.destroyAllWidgets() // to remove recharge selling_plan_id selector
      if( $(this).index() == 0 ) {

        $( '.choose-my-flavor button' ).text( 'Choose My Flavor' );

      }
      else {

        $( '.choose-my-flavor button' ).text( 'Choose My Flavors' );

      }

      $( '.product-bundle-step3 .product-bundle-progress' ).hide();

      $( '.product-bundle-plans li' ).removeClass( 'active' );

      $( this ).addClass( 'active' );


      $('.checkbox-plan-trial').prop('checked', false);

      $( this ).find( 'input' ).prop('checked', true);

      // jQuery( '.template-product .section-featured-product' ).hide();
      jQuery( '.template-product .section-featured-product' ).css( { 'opacity' : 0, 'visibility': 'hidden', 'height': 0 } );

      jQuery( '.template-product #recharge-bundles' ).hide();

      // $( '.bundle-plan-instructions' ).hide("slide", { direction: "down" }, 1000);

      // $( '.bundle-plan-instructions' ).slideUp();
      // $( this ).find( '.bundle-plan-instructions' ).slideDown();

    } );

    // setTimeout( function() {

      $('.bundle-slider-wrap').show();

      $('.slick-slider').slick({
          dots: true,
          adaptiveHeight: true,
      });

    // }, 500 );

    $(".slick-paginate li").click(function(){

      let slide = $(this).data('slide');

      $(".slick-paginate li").removeClass('slick-act');

      $(this).addClass('slick-act');

      $('.slick-slider').slick('slickGoTo', slide-1);

    });


    $('.slick-slider').on('afterChange', function(slick, currentSlide){

      $('.slick-paginate li').removeClass('slick-act');

      $('.slick-paginate li').each(function(){

        if( $(this).data('slide') == (currentSlide.currentSlide + 1) ) {

          $(this).addClass('slick-act');

        }

      });

    });

    $( '.product-bundle-progress li' ).on( 'click', function() {

      if( $( 'body' ).hasClass( 'page-mama-balls' ) ) {
        return;
      }

      let progress_no = $(this).find( '.progress-no' ).text();

      if( progress_no == 1 ) {

        jQuery('html, body').animate({
            scrollTop: jQuery( '.product-bundle-steps' ).offset().top - 100
        }, 500);

      }
      else if( progress_no == 2 ) {

        jQuery('html, body').animate({
            scrollTop: jQuery( '.product-bundle-step2' ).offset().top - 100
        }, 500);

      }

    } );


    jQuery( '.slideshow-btns .line-3:first-child span' ).on( 'click', function() {

        jQuery('html, body').animate({
            scrollTop: jQuery( '#shopify-section-template--16409730384117__16364782805b5cd846' ).offset().top - 60
        }, 500);

    } );

    jQuery( '.slideshow-btns .line-3:last-child span' ).on( 'click', function() {

        jQuery('html, body').animate({
            scrollTop: jQuery( '#shopify-section-template--16409730384117__1662045310d14bd9e9' ).offset().top - 60
        }, 500);

    } );


  });

  jQuery( window ).on( 'load', function(event) {

    event.preventDefault();

    const params = new URLSearchParams(window.location.search)

    $('.product-bundle-plans li.active').find( 'input' ).prop('checked', true);
    // $('.product-bundle-plans li.active').find( '.bundle-plan-instructions' ).show();

    if( params.has( 'product' ) && params.get( 'product' ) == 'bundle' && params.has( 'step' ) && params.get( 'step' ) != '' ) {

      const step = params.get( 'step' );

      // $( '.bundle-plan-instructions' ).hide();
      // $('.checkbox-plan-trial').prop('checked', false);
      // $( '.product-bundle-plans li' ).removeClass( 'active' );
      // $( '.product-bundle-plans li:first-child' ).addClass( 'active' );
      // $( '.product-bundle-plans li:first-child' ).find( 'input' ).prop('checked', true);
      // $( '.product-bundle-plans li:first-child' ).find( '.bundle-plan-instructions' ).show();

      if( step == 2 ) {

        jQuery('html, body').animate({
          scrollTop: jQuery( '.product-bundle-step2' ).offset().top - 100
        }, 500);

      }

    }

  })
}

$(document).on('click', '.custom-alt-atc', function(){
  console.log('here');
  const variantId = $(this).closest('form').find('.original-selector').val();
  $.ajax({
    type: "POST",
    url: "/cart/add.js",
    data: {
      id: variantId,
      quantity: 1
    },
    dataType: "json",
    success: function (data) {
      document.location.href = '/checkout';
    },
  });
})
