# librerie necessarie
from shapely.geometry import Point, LineString
import geopandas as gpd
import pandas as pd
from shapely import wkt
import json

# url dei file json https://github.com/palo-landrae/palo-opendata
piste_united = gpd.read_file('https://raw.githubusercontent.com/palo-landrae/palo-opendata/master/dati/piste_ciclabili_united.geojson')
piste_centroid = gpd.read_file('https://raw.githubusercontent.com/palo-landrae/palo-opendata/master/dati/piste_centroid.json')

# una funzione per aggiornare i file json nella cartella static
def update_json(data):
    #converte gli oggetti Python in json, indent = 4 indica quanti spazi per livello
    json_object = json.dumps(data, indent=4)
    #geopandas l'oggetto json e crea un GeoDataFrame 
    gdf = gpd.read_file(json_object)

    percorso = pointToLines(gdf)
    gdfIntersect = getIntersect(percorso, piste_united)
    gdfIntersect2 = getIntersect2(percorso, gdfIntersect)
    percorso_centroid = getPercorsoCentroid(gdfIntersect)
    punti_intersect = getViaPoints(gdfIntersect, percorso_centroid)

    #Dopo aver manipulato i dati in geopandas, scarico i geodataframe in file .json
    gdfIntersect2.to_file('static/intersect.json', driver="GeoJSON")
    punti_intersect.to_file('static/punti_intersect.json', driver="GeoJSON")

#converte un gdf con una geometria di Points() ad un gdf con LineStrings()
def pointToLines(data):
    #dataframe temporaneo con una riga a caso per inizializzare
    df = pd.DataFrame({'geometry': [Point(1, 1)]})

    for i in range(0, len(data)-1):
        #LineString([Point() di n, Point() di n+1])
        new_row = {'geometry': str(LineString([data.iloc[i]['geometry'], data.iloc[i+1]['geometry']]))}
        #aggiungo la nuova riga in df
        df = df.append(new_row, ignore_index=True)

    #tolgo la prima riga
    df = df.drop(0).reset_index(drop=True)
    #.apply(wkt.loads) converte la colonna 'geometry' in una vera colonna geometry
    df['geometry'] = df['geometry'].apply(wkt.loads)

    percorso = gpd.GeoDataFrame(df, crs=data.crs)
    return percorso

# Mi restituisce un gdf con piste_united come base (es. piste_united.intersect(buffer))
def getIntersect(percorso, piste_united):
    # gdf.intersection(gdf) mi restituisce l'intersezione come una singola geometry.
    # non le righe di gdf che intersica con un'altro gdf (gdf[gdf.intersects(gdf.unary_union)])
    intersect = piste_united.intersection(percorso.to_crs(epsg='3857').buffer(8).squeeze().to_crs(epsg='4326').unary_union).to_frame()
    # seleziono solo la colonna anagrafica e faccio .join con la intersect
    df = piste_united['anagrafica'].to_frame().join(intersect)
    # rinomino 0 in geometry per poterlo impostare come 'geometry'
    gdfIntersect = df.rename(columns={0:'geometry'}).set_geometry('geometry')
    # seleziono solo le righe piene
    gdfIntersect = gdfIntersect[~gdfIntersect['geometry'].is_empty]
    
    return gdfIntersect

# Mi restituisce un gdf con percorso come base (es. percorso.intersect(buffer))
# così faccio vedere le piste ciclabili sopra il percorso (soltanto una preferenza per l'aspetto visivo)
def getIntersect2(percorso, gdfIntersect):
    buffer = percorso.to_crs(epsg='3857').buffer(8).squeeze().to_crs(epsg='4326');
    # faccio l'intersect con gdfIntersect perchè ha i MultiLineStrings di intersezione 
    # (invece di fare un nuovo loop per tutte le piste, faccio solo il loop con gdfIntersect)
    gdfIntersect2 = percorso[buffer.intersects(gdfIntersect.unary_union)]
    return gdfIntersect2

# Mi restituisce un gdf con i baricentri di gdfIntersect
def getPercorsoCentroid(gdf):
    #dataframe temporaneo con una riga per inizializzare
    df = pd.DataFrame({'geometry': [Point(1,1)]})

    for i in range (0, len(gdf)):
        # .centroid calcola il baricentro di una geometry
        new_row = {'geometry': str(gdf.iloc[i].values[1].centroid)}
        #aggiungo la nuova riga in df
        df = df.append(new_row, ignore_index=True)

    #tolgo la prima riga
    df = df.drop(0).reset_index(drop=True)
    # .apply(wkt.loads) converte la colonna 'geometry' in una vera colonna geometry
    df['geometry'] = df['geometry'].apply(wkt.loads)

    percorso_centroid = gpd.GeoDataFrame(df, crs=gdf.crs)
    return percorso_centroid

# Aggancia i baricentri sulle linee di gdfIntersect
def getViaPoints(gdf, percorso_centroid):
    #dataframe temporaneo con una riga per inizializzare
    df = pd.DataFrame({'anagrafica' : '-', 'geometry': [Point(1,1)]})

    for i in range (0, len(gdf)):
        # geometry.interpolate(geometry.project(point)) aggancia automaticamente il punto sulla linea
        new_row = {'anagrafica' : gdf.iloc[i].values[0],'geometry': str(gdf.iloc[i].values[1].interpolate(gdf.iloc[i].values[1].project(percorso_centroid.iloc[i].values[0])))}
        #aggiungo la nuova riga in df
        df = df.append(new_row, ignore_index=True)

    #tolgo la prima riga
    df = df.drop(0).reset_index(drop=True)
    # .apply(wkt.loads) converte la colonna 'geometry' in una vera colonna geometry
    df['geometry'] = df['geometry'].apply(wkt.loads)

    punti_intersect = gpd.GeoDataFrame(df, crs=gdf.crs)
    return punti_intersect

