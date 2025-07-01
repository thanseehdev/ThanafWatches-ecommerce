const Banner=require('../../model/bannerModel')

module.exports={

    getBanner:async(req,res)=>{
        try{

            const page = parseInt(req.query.page) || 1; // Current page number, default to 1
            const limit = 3; // Number of products per page
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;


            const bannerss=await Banner.find()
            const banners= bannerss.slice(startIndex, endIndex);
            const totalPages = Math.ceil(bannerss.length / limit);

            res.render('admin/banner',{banners,currentPage: page,totalPages: totalPages})
        }
        catch(err){
            console.log(err)
        }
    },

    addBanner: async (req, res) => {
        try {
            console.log('inside get add banner>>>>')
            const imgFiles = req?.files
            let title = req.body.title;
            console.log(title + " image title>>>")
            let image = imgFiles.image && imgFiles.image[0] && imgFiles.image[0].filename;
    
            console.log(image + " banner image>>>")
            const bannerExist = await Banner.findOne({ title: req.body.title })
    
            if (!bannerExist) {
                console.log("inside banner creation")
                const bannerDtls = { title, image }
                await Banner.create(bannerDtls)
                res.redirect('/admin/banner')
            } else {
                res.redirect('/admin/banner')
            }
    
        } catch (err) {
            console.log(err)
        }
    },

    deleteBanner:async(req,res)=>{
        try{
            console.log("inside delete banner>>>>")
            const id=req.query.bannerId
            await Banner.findByIdAndDelete(id)
            res.json({msg:'banner deleted successfully'})
        }
        catch(err){
            console.log(err)
        }
    }



}