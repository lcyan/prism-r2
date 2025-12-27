"use strict"

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from "@chakra-ui/react"

export const toaster = createToaster({
  placement: "top-end",
  pauseOnPageIdle: true,
})

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ md: "4" }}>
        {(toast) => (
          <Toast.Root 
            width="auto"
            minW="120px"
            borderRadius="2xl" 
            shadow="xl" 
            p={4}
            bg={toast.type === "success" 
                ? { base: "rgba(240, 255, 244, 0.8)", _dark: "rgba(34, 54, 40, 0.8)" } 
                : { base: "whiteAlpha.800", _dark: "whiteAlpha.100" }}
            color={toast.type === "success" ? "green.600" : "inherit"}
            border="1px solid"
            borderColor={toast.type === "success" ? "green.500/20" : "whiteAlpha.300"}
            backdropFilter="blur(20px)"
          >
            {toast.type === "loading" ? (
              <Spinner size="sm" color="blue.500" />
            ) : (
              <Toast.Indicator color={toast.type === "success" ? "green.500" : "inherit"} />
            )}
            <Stack gap="1" flex="1">
              {toast.title && <Toast.Title fontWeight="bold" fontSize="sm">{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description fontSize="xs" color={toast.type === "success" ? "green.600/80" : "fg.muted"}>
                  {toast.description}
                </Toast.Description>
              )}
            </Stack>
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  )
}
