import { groq } from "next-sanity";

/**
 * GROQ queries used across the site.
 * Convention: `*Query` suffix per BRIEF §11.
 */

export const allProductsQuery = groq`
  *[_type == "product"] | order(orderRank asc, title asc) {
    _id,
    title,
    sku,
    "slug": slug.current,
    authorized,
    exclusive,
    safetyCritical,
    shortDescription_en,
    shortDescription_th,
    "brand": brand->{ name, "slug": slug.current },
    "category": category->{ title_en, title_th, "slug": slug.current }
  }
`;

export const featuredProductsQuery = groq`
  *[_type == "product" && (exclusive == true || safetyCritical == true)]
    | order(orderRank asc) [0...6] {
    _id,
    title,
    sku,
    "slug": slug.current,
    authorized,
    exclusive,
    safetyCritical,
    shortDescription_en,
    shortDescription_th,
    "image": gallery[0],
    "brand": brand->{ name, "slug": slug.current },
    "category": category->{
      title_en,
      title_th,
      "slug": slug.current,
      "parentSlug": parent->slug.current
    }
  }
`;

export const productsByCategoryQuery = groq`
  *[_type == "product" && category->slug.current == $category]
    | order(orderRank asc, title asc) {
    _id,
    title,
    sku,
    "slug": slug.current,
    authorized,
    exclusive,
    safetyCritical,
    shortDescription_en,
    shortDescription_th,
    "image": gallery[0],
    "brand": brand->{ name, "slug": slug.current },
    "category": category->{
      title_en,
      title_th,
      "slug": slug.current,
      "parentSlug": parent->slug.current
    }
  }
`;

export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    title_en,
    title_th,
    "slug": slug.current,
    description_en,
    description_th,
    heroImage,
    "parentSlug": parent->slug.current
  }
`;

export const categorySlugsQuery = groq`
  *[_type == "category"
    && defined(slug.current)
    && !(_id in path("drafts.**"))
    && parent->slug.current != "safety"]
    { "slug": slug.current }
`;

export const brandsByCategoryQuery = groq`
  *[_type == "brand" && count(*[_type == "product" && references(^._id) && category->slug.current == $category]) > 0] {
    _id,
    name,
    "slug": slug.current,
    authorizedDistributor,
    whyWeCarryIt_en,
    whyWeCarryIt_th,
    logo
  }
`;

export const projectsByCategoryQuery = groq`
  *[_type == "project" && count(productsUsed[@->category->slug.current == $category]) > 0]
    | order(year desc) [0...3] {
    _id,
    title_en,
    title_th,
    "slug": slug.current,
    customer,
    sector,
    capacity,
    location,
    year,
    heroImage
  }
`;

export const allCategoriesQuery = groq`
  *[_type == "category"] | order(orderRank asc) {
    _id,
    title_en,
    title_th,
    "slug": slug.current,
    "parentSlug": parent->slug.current
  }
`;

export const featuredProjectsQuery = groq`
  *[_type == "project" && featured == true] | order(year desc) [0...3] {
    _id,
    title_en,
    title_th,
    "slug": slug.current,
    customer,
    sector,
    capacity,
    location,
    year,
    heroImage
  }
`;

export const homepageCertificationsQuery = groq`
  *[_type == "certification" && showOnHomepage == true] {
    _id, name, logo
  }
`;

export const latestArticlesQuery = groq`
  *[_type == "article"] | order(publishedAt desc) [0...3] {
    _id,
    title_en,
    title_th,
    "slug": slug.current,
    excerpt_en,
    excerpt_th,
    heroImage,
    publishedAt
  }
`;

export const productBySkuQuery = groq`
  *[_type == "product" && slug.current == $sku][0] {
    _id,
    title,
    sku,
    "slug": slug.current,
    authorized,
    exclusive,
    safetyCritical,
    shortDescription_en,
    shortDescription_th,
    overview_en,
    overview_th,
    gallery,
    specs,
    compliance,
    "datasheet": datasheet->{ title, "url": file.asset->url },
    "wiringDiagram": wiringDiagram->{ title, "url": file.asset->url },
    "installManual": installManual->{ title, "url": file.asset->url },
    "brand": brand->{
      _id,
      name,
      "slug": slug.current,
      authorizedDistributor,
      whyWeCarryIt_en,
      whyWeCarryIt_th,
      "authorizationDocument": *[_type == "docFile" && references(^._id)][0]{
        title, "url": file.asset->url
      }
    },
    "category": category->{
      _id,
      title_en,
      title_th,
      "slug": slug.current,
      "parentSlug": parent->slug.current
    },
    "pairsWellWith": pairsWellWith[]->{
      _id,
      title,
      sku,
      "slug": slug.current,
      shortDescription_en,
      shortDescription_th,
      "image": gallery[0],
      "brand": brand->{ name, "slug": slug.current },
      "category": category->{
        title_en,
        title_th,
        "slug": slug.current,
        "parentSlug": parent->slug.current
      }
    }
  }
`;

export const productSkuTuplesQuery = groq`
  *[_type == "product" && defined(slug.current) && !(_id in path("drafts.**"))] {
    "sku": slug.current,
    "category": category->slug.current,
    "brand": brand->slug.current,
    "parentSlug": category->parent->slug.current
  }
`;

export const relatedByBrandQuery = groq`
  *[_type == "product"
    && brand->slug.current == $brand
    && slug.current != $sku]
    | order(orderRank asc) [0...4] {
    _id,
    title,
    sku,
    "slug": slug.current,
    shortDescription_en,
    shortDescription_th,
    "image": gallery[0],
    "brand": brand->{ name, "slug": slug.current },
    "category": category->{
      title_en,
      title_th,
      "slug": slug.current,
      "parentSlug": parent->slug.current
    }
  }
`;

export const projectsByProductQuery = groq`
  *[_type == "project" && $productId in productsUsed[]._ref]
    | order(year desc) [0...3] {
    _id,
    title_en,
    title_th,
    "slug": slug.current,
    customer,
    sector,
    capacity,
    location,
    year,
    heroImage
  }
`;

export const rapidShutdownProductsQuery = groq`
  *[_type == "product" && category->slug.current == "rapid-shutdown"]
    | order(orderRank asc) {
    _id,
    title,
    sku,
    "slug": slug.current,
    authorized,
    exclusive,
    safetyCritical,
    shortDescription_en,
    shortDescription_th,
    "image": gallery[0],
    "brand": brand->{ name, "slug": slug.current },
    "category": category->{
      title_en,
      title_th,
      "slug": slug.current,
      "parentSlug": parent->slug.current
    }
  }
`;

export const rapidShutdownCertificationsQuery = groq`
  *[_type == "certification" && (
    name match "IEC*" ||
    name match "NEC*" ||
    name match "TIS*" ||
    name match "UL*"
  )] {
    _id, name, logo
  }
`;

export const projoyAuthorizationDocQuery = groq`
  *[_type == "brand" && slug.current == "projoy"][0] {
    "authDoc": *[_type == "docFile" && references(^._id)][0]{
      title, "url": file.asset->url
    }
  }
`;

export const authorizationDocsQuery = groq`
  *[_type == "docFile" && documentType == "authorization"] {
    _id,
    title_en,
    title_th,
    "url": file.asset->url,
    thumbnail
  }
`;

export const productsByCategoriesQuery = groq`
  *[_type == "product" && category->slug.current in $categories]
    | order(orderRank asc) [0...6] {
    _id,
    title,
    sku,
    "slug": slug.current,
    authorized,
    exclusive,
    safetyCritical,
    shortDescription_en,
    shortDescription_th,
    "image": gallery[0],
    "brand": brand->{ name, "slug": slug.current },
    "category": category->{
      title_en,
      title_th,
      "slug": slug.current,
      "parentSlug": parent->slug.current
    }
  }
`;

export const projectsBySectorsQuery = groq`
  *[_type == "project" && sector in $sectors]
    | order(year desc) [0...3] {
    _id,
    title_en,
    title_th,
    "slug": slug.current,
    customer,
    sector,
    capacity,
    location,
    year,
    heroImage
  }
`;

export const upcomingTrainingSessionsQuery = groq`
  *[_type == "trainingSession" && endDate >= $today]
    | order(startDate asc) {
    _id,
    title_en,
    title_th,
    startDate,
    endDate,
    format,
    province,
    host,
    capacity,
    seatsRemaining,
    registrationUrl,
    language
  }
`;

export const nextUpcomingTrainingSessionsQuery = groq`
  *[_type == "trainingSession" && endDate >= $today]
    | order(startDate asc) [0...3] {
    _id,
    title_en,
    title_th,
    startDate,
    endDate,
    format,
    province,
    host,
    capacity,
    seatsRemaining,
    registrationUrl,
    language
  }
`;

export const allTeamMembersQuery = groq`
  *[_type == "teamMember"] | order(department asc, name asc) {
    _id,
    name,
    role_en,
    role_th,
    department,
    photo,
    email,
    phone,
    lineId
  }
`;

export const allProjectsQuery = groq`
  *[_type == "project"] | order(year desc, capacityKw desc) {
    _id,
    title_en,
    title_th,
    "slug": slug.current,
    customer,
    sector,
    capacity,
    location,
    year,
    heroImage
  }
`;

export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title_en,
    title_th,
    "slug": slug.current,
    customer,
    sector,
    capacity,
    capacityKw,
    location,
    year,
    heroImage,
    gallery,
    challenge_en,
    challenge_th,
    solution_en,
    solution_th,
    results_en,
    results_th,
    testimonial_en,
    testimonial_th,
    "productsUsed": productsUsed[]->{
      _id,
      title,
      sku,
      "slug": slug.current,
      shortDescription_en,
      shortDescription_th,
      "image": gallery[0],
      "brand": brand->{ name, "slug": slug.current },
      "category": category->{
        title_en,
        title_th,
        "slug": slug.current,
        "parentSlug": parent->slug.current
      }
    }
  }
`;

export const projectSlugsQuery = groq`
  *[_type == "project" && defined(slug.current) && !(_id in path("drafts.**"))]
    { "slug": slug.current }
`;

export const allArticlesQuery = groq`
  *[_type == "article"] | order(publishedAt desc) {
    _id,
    title_en,
    title_th,
    "slug": slug.current,
    excerpt_en,
    excerpt_th,
    heroImage,
    category,
    publishedAt
  }
`;

export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    title_en,
    title_th,
    "slug": slug.current,
    excerpt_en,
    excerpt_th,
    body_en,
    body_th,
    heroImage,
    category,
    publishedAt,
    "author": author->{ name, role, photo }
  }
`;

export const articleSlugsQuery = groq`
  *[_type == "article" && defined(slug.current) && !(_id in path("drafts.**"))]
    { "slug": slug.current }
`;

export const docsByTypeQuery = groq`
  *[_type == "docFile" && documentType == $docType] | order(title_en asc) {
    _id,
    title_en,
    title_th,
    documentType,
    "url": file.asset->url,
    fileSize,
    version,
    thumbnail,
    "relatedProducts": relatedProducts[]->{ _id, title, "slug": slug.current }
  }
`;

export const allDocsQuery = groq`
  *[_type == "docFile"] | order(documentType asc, title_en asc) {
    _id,
    title_en,
    title_th,
    documentType,
    "url": file.asset->url,
    fileSize,
    version,
    thumbnail
  }
`;

export const firefighterProductsQuery = groq`
  *[_type == "product" && category->slug.current == "firefighter-safety-switches"]
    | order(orderRank asc) {
    _id,
    title,
    sku,
    "slug": slug.current,
    authorized,
    exclusive,
    safetyCritical,
    shortDescription_en,
    shortDescription_th,
    "image": gallery[0],
    "brand": brand->{ name, "slug": slug.current },
    "category": category->{
      title_en,
      title_th,
      "slug": slug.current,
      "parentSlug": parent->slug.current
    }
  }
`;
