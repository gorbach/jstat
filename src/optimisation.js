jStat.extend({

	gradcheck: function( f ) {
	// TODO	
	},
			

});


jStat.test = function( inputs, opt_method, options) {

var c = new jStat.cost(inputs, 'normal');
var par1 = c.median;
var par2 = ((c.upper-c.lower)/(2*0.6744898));
var m = par1;
var v = par2;
if(opt_method == "Nelder-Mead")
var normal_params = new jStat.optim(jStat([[par1,par2],[0.1,0.3],[0.3,0.9]]),c, opt_method, options);
else
var normal_params = new jStat.optim([par1,par2], c, opt_method, options);

c.distribution = 'beta';
m1 = (c.median - c.lb)/(c.ub-c.lb);
v1 = v/jStat.sq((c.upper - c.lower));
c.lower -= c.lb/(c.ub - c.lb);
c.median -= c.lb/(c.ub - c.lb);
c.upper -= c.lb/(c.ub - c.lb);
c.ub -= c.lb/(c.ub - c.lb);
c.lb = 0;
par1 = m1^3/v1*(1/m1-1)-m1;
par2 = par1/m1-par1;
if(opt_method =="Nelder-Mead")
var beta_params = new jStat.optim(jStat([[par1, par2],[0.1,0.2],[0.3,0.1]]),c, opt_method, options);
else
var beta_params = new jStat.optim([par1,par2], c, opt_method, options);

c.distribution = 'gamma';
par1 = jStat.sq(c.median)/v;
par2 = v/m;
if(opt_method=="Nelder-Mead")
var gamma_params = new jStat.optim(jStat([[par1, par2],[0.1,0.2],[0.3,0.1]]),c, opt_method, options);
else
var gamma_params = new jStat.optim([par1,par2], c, opt_method, options);

c.distribution = 'lognormal';
par1 = Math.log(c.median);
par2 = (Math.log(c.upper) - Math.log(c.lower))/(2*0.6744898);
if(opt_method=="Nelder-Mead")
var lnormal_params = new jStat.optim(jStat([[par1, par2],[0.1,0.2],[0.3,0.1]]),c, opt_method, options);
else
var lnormal_params = new jStat.optim([par1,par2], c, opt_method, options);

//c.distribution = "studentt";
//par1 = m;
//par2 = v;
//var studentt_params = new jStat.optim(jStat([[par1, par2],[0.1,0.2],[0.3,0.1]]),c, opt_method, options);

//return [normal_params, beta_params, gamma_params, lnormal_params];

//Finding Best Fit
var min_dist = Math.min(normal_params.funcvalue,Math.min(beta_params.funcvalue, Math.min(gamma_params.funcvalue,lnormal_params.funcvalue)));
if(min_dist == normal_params.funcvalue) {
	normal_params.dist = jStat.normal(normal_params.param[0],normal_params.param[1]);
	normal_params.dname="normal";
	return normal_params;
}
else if(min_dist == beta_params.funcvalue) {
	beta_params.dist = jStat.beta(beta_params.param[0],beta_params.param[1]);
	beta_params.dname="beta";
	return beta_params;
}
else if(min_dist == gamma_params.funcvalue) {
	gamma_params.dist = jStat.gamma(gamma_params.param[0],gamma_params.param[1]);
	gamma_params.dname="gamma";
	return gamma_params;
}
else {
	lnormal_params.dist = jStat.lognormal(lnormal_params.param[0],lnormal_params.param[1]);
	lnormal_params.dname="lognormal";
	return lnormal_params;
}
}


jStat.return_obj = function() {
			if (!( this instanceof arguments.callee )) return new jStat.return_obj();
			this.funclog = [];
			this.pointlog = [];
			this.funcvalue = null;
			this.param = null;
			this.dist=null;
			this.dname=null;
};			


jStat.cost = function(inputs, dist) {
	if (!( this instanceof arguments.callee )) return new jStat.cost( inputs , dist);
	this.lb = inputs[0]
	this.lower = inputs[1];
	this.median = inputs[2];
	this.upper = inputs[3];
	this.ub = inputs[4];
	this.distribution = dist;
};

jStat.extend(jStat.cost, {

	value: function ( params, obj) {

		if(params.length == 2) {
			var param1 = params[0], param2 = params[1];
			var _dist = jStat.normal(param1, param2);
			if(obj.distribution == "gamma") {
				_dist = jStat.gamma(param1, param2);
			}
			else if(obj.distribution == "normal") {
				_dist = jStat.normal(param1, param2);
			}
			else if(obj.distribution == "beta") {
				_dist = jStat.beta(param1, param2);
			}
			else if(obj.distribution == "lognormal") {
				_dist = jStat.lognormal(param1, param2);
			}
		}
		//else if(obj.distribution == "studentt") {
		//	_dist = jStat.studentt(param1);
		//}
		sum = 0.0;
		sum += (jStat.sq((_dist.cdf(obj.lb) - 0.0)) + jStat.sq(_dist.cdf(obj.lower) - 0.25) + jStat.sq(_dist.cdf(obj.median) - 0.50) + jStat.sq(_dist.cdf(obj.upper) - 0.75) + jStat.sq((_dist.cdf(obj.ub) - 1.0)));
		return sum;

	},
	
	gradf: function( params, obj) {
		var x = params[0];
		var y = params[1];
		var del = 0.00001;
		var fx = (obj.value([x+del,y]) - obj.value([x-del,y]))/(2*del);
		var fy = (obj.value([x,y+del]) - obj.value([x,y-del]))/(2*del);
		return [fx,fy];
	}
	
});

(function( vals ) {
	for ( var item in vals ) (function( item ) {
		jStat.cost.prototype[ item ] = function( x ) {
			    return jStat.cost[ item ]( x,this);
		};
	})( vals[ item ]);
})( 'value gradf'.split( ' ' ));



jStat.optim = function( params, func, opt_method, options ) {
	if (!( this instanceof arguments.callee )) return new jStat.cost( params, func, opt_method, options);
	this.params = params;
	this.func = func;
	this.opt_method = opt_method;
	this.options = options;
	this.y = [];
	this.psum = [];

	if(opt_method == "Nelder-Mead") {	
		for(var i=0; i< params.rows(); i++) {
			this.y[i] = func.value(params[i]);
		}
	}
	return this.calculate();	
};
	
jStat.extend(jStat.optim, {

	get_sum: function(obj) {
			var i,j,sum;
			mtps = obj.params.rows();
			ndim = obj.params.cols();
			for(j = 0; j< ndim; j++) {
	   	 		for( sum = 0.0, i = 0; i< mtps; i++) {
					sum += obj.params[i][j];
	  	  		}
				obj.psum[j] = sum;
			}
		},


	calculate: function(obj) {

			if ( obj.opt_method == "Nelder-Mead" ) {
			var result = new jStat.return_obj();
			var NMAX = 5000;
			var rtol, ytry, ysave;
			var i, j, ihi, ilo, inhi;
			var temp;
			var tiny = 1.0 * Math.exp(-10);
			var ftol = 0.0001; 
			var mtps = obj.params.rows();
			var ndim = obj.params.cols();
			var nfunk = 0;
			
			obj.get_sum();

			for( ; ;) {
			    ilo = 0;
			    ihi = obj.y[0]> obj.y[1] ? (inhi=1, 0) : (inhi = 0,1);
			    for ( i = 0; i < mtps; i++) {
				if( obj.y[i] <= obj.y[ilo])
				    ilo = i;
				if(obj.y[i] > obj.y[ihi]) {
				    inhi = ihi;
				    ihi = i;
				}
				else if ( obj.y[i] > obj.y[inhi] && i != ihi )
				    inhi = i;
			    }
			    result.pointlog.push(obj.params[ihi]);
		
			    rtol = 2.0 * Math.abs( obj.y[ihi] - obj.y[ilo])/(Math.abs(obj.y[ihi]) + Math.abs(obj.y[ilo]) + tiny);
		
			    if(rtol < ftol) {
				temp = obj.y[0];
				obj.y[0] = obj.y[ilo];
				obj.y[ilo] = temp;
				for( i = 0; i < ndim; i++) {
				    temp = obj.params[0][i];
				    obj.params[0][i] = obj.params[ilo][i];
				    obj.params[ilo][i] = temp;
				}
				break;
			    }
		
			    if( nfunk >= NMAX)
				return null;
		
			    nfunk += 2;
		
			    ytry = obj.amotry(ihi, -1.0);
			    result.funclog.push(ytry);
		
			    if( ytry <= obj.y[ilo]) {
				ytry = obj.amotry(ihi, 2.0);
				result.funclog.push(ytry);
			    }
			    else if( ytry >= obj.y[inhi]) {
				ysave = obj.y[ihi];
				ytry = obj.amotry(ihi, 0.5);
				result.funclog.push(ytry);
	
				if( ytry >= ysave) {

				    for( i = 0; i<mtps; i++) {
					if( i != ilo) {
					    for (j = 0; j<ndim ; j++) 
						obj.params[i][j] = obj.psum[j] = 0.5 * (obj.params[i][j] + obj.params[ilo][j]);
					    obj.y[i] = obj.func.value(obj.psum);
					}
				    }
				    nfunk += ndim;
				obj.get_sum();
				}
			    }
			    else
				--nfunk;
			}
				result.param = obj.params[0];
				result.funcvalue = obj.func.value(obj.params[0]);
				return result;
			}
			else if ( obj.opt_method == "SCG" || obj.opt_method == "scg") {
				var result = new jStat.return_obj();
				var gradf =obj.func.gradf;
				var sigma0 = Math.exp(-4);
				var fold = obj.func.value(obj.params);
				//alert(fold);
				var fnow = fold;
				var x = (obj.params);
				var gradnew = obj.func.gradf(x);
				var gradold = gradnew;
				var d = jStat.vec_mult(gradnew,-1);
				//alert(gradnew),alert(d);
				var success = 1, nsuccess = 0, beta = 1.0, betamin = Math.exp(-15), betamax = Math.exp(100), j = 1;
				var mu, kappa, sigma, theta,delta, alpha, Delta, gamma;
				var xplus = [], gplus = [], xnew = [], fnew = [];
				var eps = Math.exp(-10);

				result.funclog.push(fold);
				result.pointlog.push(x);
				
				while( j <= 5000) {
					if( success == 1) {
						mu = jStat.dot(d,gradnew);
						if( mu >=0 ) {
							d = jStat.vec_mult(gradnew,-1);
							mu = jStat.dot(d,gradnew);
						}
						kappa = jStat.dot(d,d);
						if( kappa < eps ) {
							result.funcvalue = fnow;
							result.param = x;
							return result;
						}
						sigma = sigma0/Math.sqrt(kappa);
						xplus = [x[0] + jStat.vec_mult(d,sigma)[0], x[1] + jStat.vec_mult(d,sigma)[1]];
						gplus = obj.func.gradf(xplus);
						theta = jStat.dot(d,jStat.vec_sub(gplus, gradnew))/sigma;
					}
					delta = theta + beta*kappa;
					//alert(gplus);
				//	alert(mu),alert(kappa),alert(sigma),alert(xplus),alert(gplus),alert(theta),alert(delta);
					if(delta <= 0) {
						delta = beta*kappa;
						beta = beta - theta/kappa;
					}
					alpha = - mu/delta;
				//	alert(alpha);
					xnew = [x[0] + jStat.vec_mult(d, alpha)[0], x[1]+jStat.vec_mult(d,alpha)[1]];
					fnew = obj.func.value(xnew);
					result.funclog.push(fnew);
					result.pointlog.push(xnew);
					
					Delta = 2*(fnew - fold)/(alpha*mu);
					if( Delta >= 0) {
						success = 1;
						nsuccess += 1;
						x= xnew;
						fnow = fnew;
					}
					else {
						success = 0;
						fnow = fold;
					}
				//	alert(xnew),alert(fnew),alert(Delta);
					if( success == 1) {
						if(Math.abs(jStat.norm(jStat.vec_mult(d,alpha))) < 0.0001 && Math.abs(fnew - fold) < 0.0001) {
							alert(xnew);
							result.funcvalue = fnew;
							result.param = xnew;
							return result;
						}
						else {
							fold = fnew;
							gradold = gradnew;
							gradnew = obj.func.gradf( x );
							if( jStat.dot(gradnew,gradnew) == 0) {
								alert(xnew);
								result.funcvalue = fnew;
								result.param = xnew;
								return result;
							}
							//alert(gradnew);
						}
					}

					if( Delta < 0.25 )
						beta = Math.min(4.0*beta, betamax);
					if( Delta > 0.75)
						beta = Math.max(0.5*beta, betamin);

				//	alert(beta);

					if(success == 1) {
						gamma = jStat.dot(jStat.vec_sub(gradold, gradnew),gradnew)/mu;
						d = jStat.vec_sub(jStat.vec_mult(d, gamma), gradnew);
					}
				//	alert(d);
					j++;
				}
				//alert(j);
				result.param = x;
				result.funcvalue = obj.func.value(x);
				return result; 
					

			}	

	},

	amotry: function(ihi, fac, obj) {
			var fac1, fac2,j,ytry_temp;
			var ndim = obj.params.cols();
			var ptry = [];	
	
		    	fac1 = (1.0 - fac )/ndim;
	    		fac2 = fac1 - fac;
		    	for (j = 0; j<ndim ; j++)
			ptry[j] = obj.psum[j] * fac1 - obj.params[ihi][j] * fac2;
	    		ytry_temp = obj.func.value( ptry) ;
	    		if( ytry_temp < obj.y[ihi]) {
				obj.y [ihi] = ytry_temp;
				for (j = 0; j < ndim; j++) {
				    obj.psum[j] += ptry[j] - obj.params[ihi][j];
				    obj.params[ihi][j] = ptry[j];
				}
			
	    		}
			return ytry_temp;
	}

});
	
(function( vals ) {
	for ( var item in vals ) (function( item ) {
		jStat.optim.prototype[ item ] = function( x , y) {
			    return jStat.optim[ item ]( x, y, this);
		};
	})( vals[ item ]);
})( 'amotry'.split( ' ' ));

(function( vals ) {
	for ( var item in vals ) (function( item ) {
		jStat.optim.prototype[ item ] = function() {
			    return jStat.optim[ item ]( this );
		};
	})( vals[ item ]);
})( 'get_sum calculate'.split( ' ' ));	
  
		
