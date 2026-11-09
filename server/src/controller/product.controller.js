import productModel from "../models/product.model.js"
import { uploadFile } from "../services/storage.service.js"




export async function createProduct(req, res) {

    try {

        const responses = await Promise.all(
            (req.files ?? []).map((file) =>
                uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname,
                })
            )
        )

        const product = await productModel.create({
            title: req.body.title,
            description: req.body.description,
            price: {
                amount: req.body.price.amount,
                currency: req.body.price.currency
            },
            sizes: req.body.sizes,
            images: responses.map((response) => response.url),
            seller: req.user.userId
        })

        res.status(201).json({
            message: "Product created successfully",
            data: {
                product
            }
        })

    } catch (err) {

        console.error("createProduct failed:", err.message)

        res.status(500).json({
            message: "Could not create the product. Check the image upload (ImageKit) and try again."
        })

    }
}

export async function listAllProducts(req, res) {

    const products = await productModel.find({ published: true })

    res.status(200).json({
        message: "Products data fetched successfully",
        data: {
            products
        }
    })
}

export async function listAllProductsToSeller(req, res) {

    const products = await productModel.find({})

    return res.status(200).json({
        message: "All products fetched successfully",
        data: {
            products
        }
    })
}

export async function unlistProduct(req, res) {

    const { id } = req.params

    const product = await productModel.findById(id)

    if (!product) {
        return res.status(404).json({
            message: "product not found by id"
        })
    }

    // –––––––––––––––––– make product unPublished –––––––––––––––––––––
    await productModel.findByIdAndUpdate(id, {
        published: false
    })

    return res.status(200).json({
        message: "Product unpublished successfully"
    })

}


export async function listProduct(req, res) {

    const { id } = req.params

    const product = await productModel.findById(id)

    if (!product) {
        return res.status(404).json({
            message: "product not found by id"
        })
    }

    // –––––––––––––––––– make product unPublished –––––––––––––––––––––
    await productModel.findByIdAndUpdate(id, {
        published: true
    })

    return res.status(200).json({
        message: "Product published successfully"
    })

}