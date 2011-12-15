$(function(){

    // External links with rel="external"
	    $('a[rel="external"]').live('click', function(e) {
	    	e.preventDefault();
	    	window.open( $(this).attr('href') )
	    })
	    
});