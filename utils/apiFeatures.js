class APIFeatures {
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }
    search(){
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        }:{}

        this.query = this.query.find({...keyword});
        return this;
    }
    filter() {
        const queryCopy = { ...this.queryStr };
    
        console.log(queryCopy);
    
        // Remove fields from queryCopy
        const removeFields = ['keyword', 'limit', 'page'];
        removeFields.forEach((el) => delete queryCopy[el]);
    
        const category = queryCopy.category;
    
        console.log('Category:', category);
    
        if (category) {
            this.query = this.query.find({ category: category });
        }
    
        // Construct the price range filter query
        if (queryCopy.price && (queryCopy.price.gte || queryCopy.price.lte)) {
            const priceFilter = {};
            if (queryCopy.price.gte) {
                priceFilter.$gte = parseFloat(queryCopy.price.gte);
            }
            if (queryCopy.price.lte) {
                priceFilter.$lte = parseFloat(queryCopy.price.lte);
            }
            this.query = this.query.find({ price: priceFilter });
        }
    
        return this;
    }
    
    pagination(resPerPage){
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage *( currentPage-1);

        this.query = this.query.skip(skip).limit(resPerPage);
        return this;
    }

}

module.exports = APIFeatures;