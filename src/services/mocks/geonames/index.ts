import { http, HttpResponse } from 'msw';

import { geonamesUrl } from '@/services/geoNames';

const getGeoNames = ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    return HttpResponse.xml(`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<rdf:RDF xmlns:cc="http://creativecommons.org/ns#" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:foaf="http://xmlns.com/foaf/0.1/" xmlns:gn="http://www.geonames.org/ontology#" xmlns:owl="http://www.w3.org/2002/07/owl#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#" xmlns:wgs84_pos="http://www.w3.org/2003/01/geo/wgs84_pos#">
    <gn:Feature rdf:about="https://sws.geonames.org/1791247/">
        <rdfs:isDefinedBy rdf:resource="https://sws.geonames.org/1791247/about.rdf"/>
        <gn:name>Wuhan</gn:name>
        <gn:alternateName xml:lang="en">Wuhan</gn:alternateName>
        <gn:featureClass rdf:resource="https://www.geonames.org/ontology#P"/>
        <gn:featureCode rdf:resource="https://www.geonames.org/ontology#P.PPLA"/>
        <gn:countryCode>CN</gn:countryCode>
        <gn:population>10392693</gn:population>
        <wgs84_pos:lat>30.58333</wgs84_pos:lat>
        <wgs84_pos:long>114.26667</wgs84_pos:long>
        <gn:parentCountry rdf:resource="https://sws.geonames.org/1814991/"/>
        <gn:nearbyFeatures rdf:resource="https://sws.geonames.org/1791247/nearby.rdf"/>
        <gn:locationMap rdf:resource="https://www.geonames.org/1791247/wuhan.html"/>
        <gn:wikipediaArticle rdf:resource="https://en.wikipedia.org/wiki/Wuhan"/>
        <rdfs:seeAlso rdf:resource="https://dbpedia.org/resource/Wuhan"/>
    </gn:Feature>
    <gn:Feature rdf:about="https://sws.geonames.org/1808963/">
        <rdfs:isDefinedBy rdf:resource="https://sws.geonames.org/1808963/about.rdf"/>
        <gn:name>Handan</gn:name>
        <gn:alternateName xml:lang="bg">Хандан</gn:alternateName>
        <gn:alternateName xml:lang="cdo">Hàng-dăng</gn:alternateName>
        <gn:alternateName xml:lang="cs">Chan-tan</gn:alternateName>
        <gn:alternateName xml:lang="eo">Handano</gn:alternateName>
        <gn:alternateName xml:lang="et">Handan Shi</gn:alternateName>
        <gn:alternateName xml:lang="fa">هاندان</gn:alternateName>
        <gn:alternateName xml:lang="he">האנדאן</gn:alternateName>
        <gn:alternateName xml:lang="ja">邯鄲市</gn:alternateName>
        <gn:alternateName xml:lang="ko">한단 시</gn:alternateName>
        <gn:alternateName xml:lang="lt">Handanas</gn:alternateName>
        <gn:alternateName xml:lang="nan">Hân-tan-chhī</gn:alternateName>
        <gn:alternateName xml:lang="ru">Ханьдань</gn:alternateName>
        <gn:alternateName xml:lang="sr">Хандан</gn:alternateName>
        <gn:alternateName xml:lang="ug">خەندەن شەھىرى</gn:alternateName>
        <gn:alternateName xml:lang="ur">ہاندان</gn:alternateName>
        <gn:alternateName xml:lang="vi">Hàm Đan</gn:alternateName>
        <gn:alternateName xml:lang="yue">邯鄲</gn:alternateName>
        <gn:alternateName xml:lang="zh">邯郸市</gn:alternateName>
        <gn:featureClass rdf:resource="https://www.geonames.org/ontology#P"/>
        <gn:featureCode rdf:resource="https://www.geonames.org/ontology#P.PPLA2"/>
        <gn:countryCode>CN</gn:countryCode>
        <gn:population>1358318</gn:population>
        <wgs84_pos:lat>36.60999</wgs84_pos:lat>
        <wgs84_pos:long>114.48764</wgs84_pos:long>
        <gn:parentCountry rdf:resource="https://sws.geonames.org/1814991/"/>
        <gn:nearbyFeatures rdf:resource="https://sws.geonames.org/1808963/nearby.rdf"/>
        <gn:locationMap rdf:resource="https://www.geonames.org/1808963/handan.html"/>
    </gn:Feature>

</rdf:RDF>
`);
};

const geonames = [http.get(`${geonamesUrl}*`, getGeoNames)];

export default geonames;
