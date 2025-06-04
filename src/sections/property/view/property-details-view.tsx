'use client';

import type { Slide, SlideImage, SlideVideo } from 'yet-another-react-lightbox';

import Image from 'next/image';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { Lightbox, useLightBox } from 'src/components/lightbox';

import type { IPropertyItemDetail } from '../../../types/property';
import { List, ListItem } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Iconify } from '../../../components/iconify';
import { formatCodeVINM } from '../../../utils/format-string';
import { fCurrency } from '../../../utils/format-number';

type Props = {
  currentProperty: IPropertyItemDetail;
}

export default function PropertyDetailsView({currentProperty}: Props) {
  const slides: Slide[] = currentProperty.images.map((image, index) => ({
    src: image,
    description: `Imagen de inmueble ${currentProperty.publicationTitle} ${index + 1}`,
    type: 'image',
  }))

  const lightbox = useLightBox(slides);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ borderBottom: '8px solid #ffebee', pb: 3, mb: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ height: 400, position: 'relative' }}>
            <Image
              src={currentProperty.images[0]}
              alt="cover Image"
              fill
              objectFit="cover"
              onClick={() => lightbox.onOpen(currentProperty.images[0])}
            />
          </Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Chip
                label={currentProperty.negotiationInformation.operationType}
                sx={{
                  display: { xs: 'inline-flex', lg: 'none' },
                  mb: 2,
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  backgroundColor: 'transparent',
                }}
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{ fontSize: { xs: '2rem', lg: '2.5rem' }, mb: 2 }}
              >
                {currentProperty.publicationTitle}
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontSize: { xs: '1.25rem', lg: '1.5rem' }, mb: 2, color: 'text.secondary' }}
              >
                {currentProperty.municipality}, {currentProperty.state}, {currentProperty.country}
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                REF - {currentProperty.code || formatCodeVINM(currentProperty.codeId)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }} sx={{ display: { xs: 'block', lg: 'none' } }}>
              <Typography variant="h3" align="center" sx={{ color: '#d32f2f', mt: 2 }}>
                {fCurrency(currentProperty.negotiationInformation.price)}
              </Typography>
            </Grid>
            <Grid
              size={{ xs: 4 }}
              sx={{
                display: { xs: 'none', lg: 'flex' },
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}
            >
              <Chip
                label={currentProperty.negotiationInformation.operationType}
                sx={{
                  mb: 2,
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  backgroundColor: 'transparent',
                }}
                variant="outlined"
              />
              <Typography variant="h3" sx={{ color: '#d32f2f' }}>
                {fCurrency(currentProperty.negotiationInformation.price)}
              </Typography>
            </Grid>
          </Grid>

          {/* Property Badges */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip
              label={`${currentProperty.footageGround || currentProperty.footageBuilding} m²`}
              variant="outlined"
              sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
            />
            <Chip
              label={currentProperty.propertyType}
              variant="outlined"
              sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
            />
            <Chip
              label={currentProperty.negotiationInformation.operationType}
              variant="outlined"
              sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
            />
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Left Column - Property Details */}
          <Grid size={{ xs: 12, lg: 9 }}>
            {/* Description */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 3 }}>
                Descripción
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                {currentProperty.description}
              </Typography>
            </Box>

            {/* Characteristics */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 3 }}>
                Características
              </Typography>
              <Grid container spacing={2}>
                {currentProperty.attributes.map((relation) => (
                  <Grid size={{ xs: 12, md: 6 }} key={relation.attributeId}>
                    <Paper elevation={0} sx={{ p: 2, borderBottom: '2px solid #f5f5f5' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Typography variant="body2">{relation.attribute.label}</Typography>
                        {relation.attribute.formType === 'check' ? (
                          <Iconify icon="eva:checkmark-fill" />
                        ) : (
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {relation.value}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Services */}
            {currentProperty.utilities.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 3 }}>
                  Servicios
                </Typography>
                <List>
                  {currentProperty.utilities.map((relation) => (
                    <ListItem
                      key={relation.utilityId}
                      sx={{ borderBottom: '2px solid #f5f5f5', px: 0 }}
                    >
                      <ListItemText
                        primary={
                          <Box>
                            <Typography variant="body2" component="span">
                              {relation.utility.title}
                            </Typography>
                            {relation.additionalInformation && (
                              <Typography
                                variant="body2"
                                component="span"
                                sx={{ color: 'text.secondary', fontWeight: 'bold' }}
                              >
                                : ({relation.additionalInformation})
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemIcon sx={{ minWidth: 'auto' }}>
                        <Iconify icon="eva:checkmark-fill" />
                      </ListItemIcon>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Equipment */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 3 }}>
                Equipos
              </Typography>
              <List>
                {currentProperty.equipments.map((relation) => (
                  <ListItem
                    key={relation.equipmentId}
                    sx={{ borderBottom: '2px solid #f5f5f5', px: 0 }}
                  >
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="body2" component="span">
                            {relation.equipment.title}
                          </Typography>
                          {relation.additionalInformation && (
                            <Typography
                              variant="body2"
                              component="span"
                              sx={{ color: 'text.secondary', fontWeight: 'bold' }}
                            >
                              : ({relation.additionalInformation})
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ListItemIcon sx={{ minWidth: 'auto' }}>
                      <Iconify icon="eva:checkmark-fill" />
                    </ListItemIcon>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Gallery */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 3 }}>
                Galería
              </Typography>
              <Box
                sx={{
                  gap: 1,
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                  },
                }}
              >
                {slides.map((slide) => {
                  const thumbnail =
                    slide.type === 'video'
                      ? (slide as SlideVideo).poster
                      : (slide as SlideImage).src;

                  return (
                    <Box
                      component="img"
                      key={thumbnail}
                      alt={thumbnail}
                      src={thumbnail}
                      onClick={() => lightbox.onOpen(`${thumbnail}`)}
                      sx={{
                        width: 240,
                        borderRadius: 1,
                        cursor: 'pointer',
                        aspectRatio: '1/1',
                        objectFit: 'cover',
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            {/* Location */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 3 }}>
                Ubicación y Adyacencias
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  property.LocationInformation.municipality, property.LocationInformation.state,
                  property.LocationInformation.country
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Urbanización:</strong> property.LocationInformation.urbanization
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Av:</strong> property.LocationInformation.avenue
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Calle:</strong> property.LocationInformation.street
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>¿Se encuentra en calle cerrada?:</strong>{' '}
                  property.LocationInformation.isClosedStreet
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Adyacencias:
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  justifyContent: { xs: 'center', md: 'flex-start' },
                }}
              >
                {currentProperty.adjacencies.map((item) => (
                  <Chip
                    key={item.adjacencyId}
                    label={item.adjacency.title}
                    variant="filled"
                    color="default"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Right Column - Contact Form */}
          <Grid size={{ xs: 12, lg: 3 }}>
            <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                Contáctanos
              </Typography>
              <Typography variant="body2" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
                Si deseas más información sobre esta propiedad, por favor, rellena el formulario.
              </Typography>
              {/*<ContactForm propertyCode={property.GeneralInformation.code} />*/}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Box />
      <Lightbox
        open={lightbox.open}
        close={lightbox.onClose}
        slides={slides}
        index={lightbox.selected}
        // disableZoom={state.disableZoom}
        // disableTotal={state.disableTotal}
        // disableVideo={state.disableVideo}
        // disableCaptions={state.disableCaptions}
        // disableSlideshow={state.disableSlideshow}
        // disableThumbnails={state.disableThumbnails}
        // disableFullscreen={state.disableFullscreen}
      />
    </Container>
  );
}
