import { checkSchema, validationResult } from "express-validator";

const postSchema = {
    text: {
        in: ["body"],
        isString: {
            errorMessage: "text validation failed , type must be string  ",
        },
    },
    image: {
        in: ["body"],
        isString: {
            errorMessage: "image validation failed , type must be string ",
        },
    },
    cloudinary_id: {
        in: ["body"],
        isString: {
            errorMessage: "cloudinary_id validation failed , type must be string ",
        },
    },
    profile: {
        in: ["body"],
        isMongoId: {
            errorMessage: "profile must be a valid mongodb id",
        },
    },
};

const commentSchema = {
    comment: {
        isString: {
            errorMessage: "comment field is required for comment",
        },
    },
};

export const checkPostSchema = checkSchema(postSchema);
export const checkCommentSchema = checkSchema(commentSchema);


