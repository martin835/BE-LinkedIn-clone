import { checkSchema, validationResult } from "express-validator";

const experienceSchema = {
    role: {
        in: ["body"],
        isString: {
            errorMessage: "role validation failed , type must be string  ",
        },
    },
    company: {
        in: ["body"],
        isString: {
            errorMessage: "company validation failed , type must be  string ",
        },
    },
    startDate: {
        in: ["body"],
        isDate: {
            errorMessage: "startDate validation failed , type must be date ",
        },
    },
    endDate: {
        in: ["body"],
        isDate: {
            errorMessage: "endDate validation failed , type must be date ",
        },
    },
    description: {
        in: ["body"],
        isString: {
            errorMessage: "description validation failed , type must be  string ",
        },
    },
    area: {
        in: ["body"],
        isString: {
            errorMessage: "area validation failed , type must be  string ",
        },
    },
    image: {
        in: ["body"],
        isString: {
            errorMessage: "image validation failed , type must be  string ",
        },
    },
};

export const checkExperienceSchema = checkSchema(experienceSchema);

export const checkValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error(`${errors.array().map(error => error.msg)}`);
        error.status = 400;
        error.errors = errors.array();
        next(error);
    }
    next();
};
