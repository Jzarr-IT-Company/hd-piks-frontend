import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import './Testmonials.css'
import StarRating from '../StarRating/StarRating';
import WriteRatingReviews from '../WriteRatingReviews/WriteRatingReviews';

// Array of testimonials
const testimonials = [
    { name: "Sarah K.", review: "Absolutely fantastic! The quality of images and videos is unmatched. I will definitely be coming back for more!", rating: 4.8 },
    { name: "John D.", review: "Incredible platform with an amazing selection. It has everything I need for my projects!", rating: 4.5 },
    { name: "Emily R.", review: "An essential resource for any designer! The variety and quality are just perfect.", rating: 4.7 },
    { name: "Michael L.", review: "This platform has truly enhanced my workflow. Very user-friendly and efficient!", rating: 4.6 },
    { name: "Anna B.", review: "Fantastic service! I was able to find high-quality content easily.", rating: 4.9 },
    { name: "Liam T.", review: "A game changer for creatives. The selection is vast, and the quality is top-notch!", rating: 4.3 },
    { name: "Emma J.", review: "I’m impressed by the quality and ease of use. This site has everything I need!", rating: 4.4 },
    { name: "Oliver W.", review: "Highly recommend this site! It's become my go-to for all my design resources.", rating: 4.8 },
    { name: "Sophia H.", review: "Superb collection! It saved me so much time on my projects!", rating: 4.5 },
    { name: "James P.", review: "Amazing experience! The resources are of very high quality and easy to find.", rating: 4.7 },
    { name: "Isabella G.", review: "The variety of content here is impressive. A must-visit for creatives!", rating: 4.6 },
    { name: "Ethan M.", review: "I love how easy it is to download and use the resources. Excellent platform!", rating: 4.5 },
    { name: "Mia F.", review: "This site has helped me a lot in my projects. Highly recommend!", rating: 4.8 },
    { name: "Ava C.", review: "A fantastic resource for high-quality images. I can always find what I need.", rating: 4.7 },
    { name: "Noah R.", review: "Superb collection of videos and photos! It’s my go-to for any creative project.", rating: 4.9 },
    { name: "Olivia P.", review: "I love the user-friendly interface! Makes finding what I need a breeze.", rating: 4.4 },
    { name: "Lucas H.", review: "Great quality and variety! This site has everything I need for my marketing materials.", rating: 4.6 },
    { name: "Amelia S.", review: "Impressive collection of high-resolution images. Highly satisfied!", rating: 4.8 },
    { name: "Elijah W.", review: "A wonderful platform for designers. I can’t imagine working without it!", rating: 4.7 },
    { name: "Harper N.", review: "An invaluable resource for content creators. Always find what I need!", rating: 4.5 },
    { name: "Mason J.", review: "I appreciate the quality of the images. It’s made my projects shine!", rating: 4.9 },
    { name: "Ella T.", review: "A fantastic selection of visuals. Very easy to use and navigate!", rating: 4.6 },
    { name: "James A.", review: "Incredible variety! I use this site for all my presentations.", rating: 4.5 },
    { name: "Grace D.", review: "This platform saves me a ton of time! Love the easy downloads.", rating: 4.8 },
    { name: "Daniel B.", review: "Great experience overall. I’ve found so many resources that fit my needs!", rating: 4.7 },
    { name: "Chloe Q.", review: "The quality is top-notch. Perfect for my design projects!", rating: 4.9 },
    { name: "Benjamin Y.", review: "A reliable source for high-quality images and videos. Highly recommend!", rating: 4.6 },
    { name: "Avery Z.", review: "Very user-friendly! The resources available are exactly what I need.", rating: 4.5 },
    { name: "Gabriel U.", review: "I love this platform! It makes my work so much easier.", rating: 4.8 },
    { name: "Sofia J.", review: "Incredible selection! I always find what I’m looking for.", rating: 4.7 },
    { name: "Leo K.", review: "I can’t recommend this site enough. The quality is just superb!", rating: 4.6 },
    { name: "Aria W.", review: "Fantastic service! This site is a lifesaver for my creative needs.", rating: 4.5 },
    { name: "Owen P.", review: "The best platform for designers! The images are always stunning.", rating: 4.8 },
    { name: "Zoe I.", review: "Very satisfied with the resources. Excellent quality!", rating: 4.7 },
    { name: "Wyatt T.", review: "Great platform! I always come here for my content needs.", rating: 4.6 },
    { name: "Luna H.", review: "Amazing user experience! I can find high-quality content in no time.", rating: 4.9 },
    { name: "Jack V.", review: "The images are always high-resolution. Perfect for any project!", rating: 4.8 },
    { name: "Lily F.", review: "Great selection of videos. This site is my first choice!", rating: 4.7 },
    { name: "Alexander J.", review: "I love the variety! This site always meets my needs.", rating: 4.6 },
    { name: "Mila G.", review: "The interface is easy to use, and the resources are top-notch!", rating: 4.5 },
    { name: "Isaac M.", review: "A fantastic tool for creatives. I use it daily!", rating: 4.9 },
    { name: "Nora E.", review: "This platform has transformed the way I find resources. Highly recommended!", rating: 4.8 },
    { name: "Sam O.", review: "I’m always impressed by the quality of the content. A great site!", rating: 4.6 },
    { name: "Peyton A.", review: "This website is a treasure! So many amazing images and videos!", rating: 4.5 },
    { name: "Mackenzie R.", review: "A must-have resource for any designer! Love this site!", rating: 4.8 },
    { name: "Carter L.", review: "The selection of content is unbeatable. I’m a frequent user!", rating: 4.7 },
    { name: "Addison H.", review: "Very high-quality visuals! It’s become my go-to for projects.", rating: 4.9 },
    { name: "Dylan C.", review: "I always find exactly what I’m looking for. Great platform!", rating: 4.6 },
    { name: "Aaliyah Y.", review: "Excellent collection! I’m very happy with the resources here.", rating: 4.5 },
    { name: "Ryan D.", review: "Fantastic experience! This site has made my life so much easier!", rating: 4.8 },
    { name: "Autumn P.", review: "A wonderful resource! I highly recommend it to all creators!", rating: 4.7 },
    { name: "Colton B.", review: "The quality of images is outstanding! I’m always impressed.", rating: 4.9 },
    { name: "Natalie Z.", review: "The site is very intuitive! It’s easy to find what I need.", rating: 4.4 },
    { name: "Leo T.", review: "Very happy with the quality of videos available here. Great site!", rating: 4.6 },
    { name: "Bella K.", review: "I love the user-friendly interface! Makes everything so simple.", rating: 4.5 },
    { name: "Caden H.", review: "An amazing platform with a wide range of options!", rating: 4.8 },
    { name: "Makayla J.", review: "This site is essential for my work. I can’t recommend it enough!", rating: 4.7 },
    { name: "Nolan R.", review: "Superb resources! This platform is a game changer!", rating: 4.6 },
    { name: "Claire E.", review: "A fantastic place for creatives! I find everything I need!", rating: 4.9 },
    { name: "Justin S.", review: "The quality is always exceptional. This site is top-notch!", rating: 4.8 },
    { name: "Serenity L.", review: "I appreciate the variety! It’s a huge help for my projects.", rating: 4.5 }
];

function Testmonials() {
    return (
        <>
        <section className='py-5' >
            <div className="container py-5 rounded-3 border" style={{backgroundColor:'#f8f9fb',boxShadow:"rgba(0, 0, 0, 0.16) 0px 1px 4px"}}>
                <h2 className="text-center mb-5 fw-bold">What Our Visitor Say</h2>
                <div className="row mt-5 py-4">
                    <div className="col-lg-12 col-md-12 col-sm-12">
                        <Swiper
                            modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
                            slidesPerView={3}
                            autoplay={{ delay: 3000, disableOnInteraction: false }}
                            loop={true}
                            breakpoints={{
                                300: {
                                    slidesPerView: 1,
                                },
                                481: {
                                    slidesPerView: 2,
                                },
                                781: {
                                    slidesPerView: 3,
                                },
                                1026: {
                                    slidesPerView: 4,
                                },
                                1201: {
                                    slidesPerView: 3,
                                },
                            }}
                        >
                            {testimonials.map((testimonial, index) => (
                                <SwiperSlide key={index} className="abc">
                                    <div className="slide-content text-center px-3">
                                    <p className='text-center'>&quot;{testimonial.review}&quot;</p>
                                        <h5>{testimonial.name}</h5>
                                        <div className="rating">
                                            <StarRating rating={testimonial.rating} />
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        <div className="d-flex justify-content-end px-3 mt-4">
                            <WriteRatingReviews/>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </>
    );
}

export default Testmonials;
